#!/usr/bin/env node

const couchUtils = require('../CARLI/Store/CouchDb/Utils')();
const db = require('../db/deploy');
const cycleRepository = require('../CARLI/Entity/CycleRepository');
const vendorRepository = require("../CARLI/Entity/VendorRepository");
const cli = require('../CARLI/CommandLine');


const roleMap = {
    vendor: ["_admin", "staff", "vendor", "readonly-staff"],
    cycle: ["_admin", "staff", "library", "readonly-staff"],
}

async function parseRoles() {
    let rolesToFixForVendorDatabases = await getVendorDatabasesThatNeedFixing();
    rolesToFixForVendorDatabases.forEach(vendorDatabase => {
        console.log(vendorDatabase);
    });

    let rolesToFixForCycleDatabases = await getCycleDatabasesThatNeedFixing();
    rolesToFixForCycleDatabases.forEach(cycleDatabase => {
        console.log(cycleDatabase);
    });

    const rolesToFix = rolesToFixForVendorDatabases.concat(rolesToFixForCycleDatabases);
    console.log(`Found ${rolesToFix.length} roles to fix`);

    cli.confirmOrExit("Do you want to fix these roles?").then(async _ => {

        for (let i = 0; i < rolesToFix.length; i++) {
            const role = rolesToFix[i];
            console.log(`Adding role ${role.role} to ${role.dbName}`);

            await couchUtils.addRoleToSecurityDoc(role.dbName, role.role);
        }
        process.exit();
    });
}

async function getVendorDatabasesThatNeedFixing() {
    console.log("Getting vendor databases that need fixing");

    let vendors = await vendorRepository.list();
    const databasesToFixPerVendor = await Promise.all(vendors.map(vendor => getVendorDatabaseThatNeedsFixing(vendor)));
    return databasesToFixPerVendor.flat();
}


async function getVendorDatabaseThatNeedsFixing(vendor) {
    const databases = (await couchUtils.listDatabases())
        .filter(dbName => dbName.includes(vendor.id));

    const vendorsToFix = [];

    for (let i = 0; i < databases.length; i++) {
        const dbName = databases[i];

        console.log(`Checking ${dbName}`);

        const securityDocument = await couchUtils.getSecurityDocument(dbName);

        const roles = securityDocument.members?.roles ?? [];

        const addFixIfRoleIsMissing = (roleName) => {
            if (!roles.find(role => role === roleName)) {
                vendorsToFix.push({dbName, role: roleName});
            }
        }

        const vendorRoleName = `vendor-${vendor.id}`;
        addFixIfRoleIsMissing(vendorRoleName);
        addFixIfRoleIsMissing("staff");
        addFixIfRoleIsMissing("_admin");
        addFixIfRoleIsMissing("readonly-staff");
    }

    return vendorsToFix;
}


async function getCycleDatabasesThatNeedFixing() {
    console.log("Getting cycle databases that need fixing");

    const cycles = await cycleRepository.list();
    const databases = cycles.map(cycle => cycle.databaseName);
    const databasesToFixPerCycle = await Promise.all(databases.map(dbName => getCycleDatabaseThatNeedsFixing(dbName)));

    return databasesToFixPerCycle.flat();
}

async function getCycleDatabaseThatNeedsFixing(dbName) {
    console.log(`Checking ${dbName}`);

    const roleFixes = [];
    const doesDatabaseExist = await couchUtils.doesDatabaseExist(dbName)

    if (!doesDatabaseExist) {
        console.log(`Database ${dbName} does not exist`);
        return roleFixes;
    }

    let securityDocument = await couchUtils.getSecurityDocument(dbName);

    const roles = securityDocument.members?.roles ?? [];

    const addFixIfRoleIsMissing = (roleName) => {
        if (!roles.find(role => role === roleName)) {
            roleFixes.push({dbName, role: roleName});
        }
    }

    addFixIfRoleIsMissing("staff");
    addFixIfRoleIsMissing("_admin");
    addFixIfRoleIsMissing("readonly-staff");
    addFixIfRoleIsMissing("library");

    return roleFixes;
}

async function addRoles(roleName = 'readonly-staff') {
    const databases = await couchUtils.listDatabases();
    const databasesToEdit = databases.filter(dbName => dbName !== '_users' && dbName !== '_replicator' && dbName !== 'activity-log');

    await databasesToEdit.reduce((acc, dbName) => acc.then(() => db.addRoleToSecurityDoc(dbName, roleName)), Promise.resolve(null));
}

async function addLibraryRoles() {
    const cycles = await cycleRepository.list();

    const databases = cycles.map(cycle => cycle.databaseName);

    await databases.reduce((acc, dbName) => acc.then(() => db.addRoleToSecurityDoc(dbName, 'library')), Promise.resolve(null));
}


parseRoles();