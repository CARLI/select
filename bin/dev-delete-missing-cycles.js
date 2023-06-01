#!/usr/bin/env node

const cli = require("../CARLI/CommandLine");
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();
const cycleRepository = require('../CARLI/Entity/CycleRepository');

deleteMissingCycles();

async function deleteMissingCycles() {
    const cycles = await getCycleDatabaseNames();
    const databases = await getAllDatabaseNames();
    const cyclesToDelete = [];
    cycles.forEach(cycle => {
        if (!databases.find(dbName => cycle.database === dbName)) {
            console.log(`${cycle.name} is missing from couch`);
            cyclesToDelete.push(cycle);
        }
    });

    const deletePromises = cyclesToDelete.map(cycle => {
        return cycleRepository.delete(cycle.cycleId)
            .then(() => console.log(`Deleted ${cycle.name}`));
    });

    await Promise.all(deletePromises);

    process.exit();
}

async function getAllDatabaseNames() {
    return await couchUtils.listDatabases();
}

async function getCycleDatabaseNames() {
    const cycles = await cycleRepository.list();

    return cycles.map(cycle => ({
        cycleId: cycle.id,
        database: cycle.databaseName,
        name: cycle.name
    }));
}