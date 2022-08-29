#!/usr/bin/env node

const cli = require('../CARLI/CommandLine');
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();

async function fixPermissions(cycleDatabaseName) {
    const databases = await couchUtils.listDatabases();
    const databasesInCycle = databases.filter(database => database.indexOf(cycleDatabaseName) > -1);

    const securityDocs = await Promise.all(databasesInCycle.map(async currentDb => {
        var security = await couchUtils.getSecurityDocument(currentDb);
        if (!security.members) {
            security.members = {
                names: [],
                roles: []
            }
        }

        if (security.members.roles.length < 4) {
            security.members.roles = makeRolesArray(currentDb);
        }

        console.log(`Updating ${currentDb}`);
        await couchUtils.updateDocument(currentDb, '_security', security);
    }));

    process.exit();

    function makeRolesArray(databaseName) {
        var roles = [
            "_admin",
            "staff",
            "readonly-staff",
        ];

        if (databaseName === cycleDatabaseName) {
            roles.push("library");
        } else {
            var vendorId = databaseName.replace(`${cycleDatabaseName}-`, '');
            roles.push(`vendor-${vendorId}`);
        }

        return roles;
    }
}

cli.withSingleArgument("cycleDatabaseName", fixPermissions)