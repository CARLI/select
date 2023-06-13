const couchUtils = require('../CARLI/Store/CouchDb/Utils')();
const couchApp = require("../middleware/components/couchApp");


async function syncCycleDatabaseViews() {
    const databases = await couchUtils.listDatabases();
    const cycleDatabases = databases.filter(dbName => dbName.startsWith('cycle-'));

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

syncCycleDatabaseViews();