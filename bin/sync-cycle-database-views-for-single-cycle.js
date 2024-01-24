const couchApp = require("../middleware/components/couchApp");
var util = require('util');
var cli = require('../CARLI/CommandLine');
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();

//Example: node bin/sync-cycle-database-views-for-single-cycle.js cycle-fiscal-year-2024
async function syncCycleDatabaseViewsForSingleCycle(cycleId) {
    const cycleDatabasePrefix = `${cycleId}`;
    const databases = await couchUtils.listDatabases();
    const cycleDatabases = databases.filter(dbName => dbName.startsWith(cycleDatabasePrefix));

    let finalPromise = cycleDatabases.reduce((promise, dbName) => {
        return promise.then(() => {
            console.log(`Syncing views for ${dbName}`);
            couchApp.putDesignDoc(dbName, "Cycle");

            return new Promise(resolve => setTimeout(resolve, 100));
        });
    }, Promise.resolve());

    await finalPromise;

    console.log("🎉🎉🎉 All cycle databases synced! 🎉🎉🎉");

    process.exit(0);
}

cli.withArguments(syncCycleDatabaseViewsForSingleCycle);