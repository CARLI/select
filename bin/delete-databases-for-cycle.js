#!/usr/bin/env node

const cli = require("../CARLI/CommandLine");
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();

cli.withSingleArgument("cycleDatabaseName", deleteDatabasesForCycle);

async function deleteDatabasesForCycle(cycleDatabaseName) {
    const databases = await couchUtils.listDatabases();
    const databasesToDelete = databases.filter(database => database.indexOf(cycleDatabaseName) > -1);

    await databasesToDelete.reduce((acc, item) => {
        return acc.then(() => {
            return couchUtils.deleteDatabase(item);
        })
    }, Promise.resolve(null));

    process.exit();
}
