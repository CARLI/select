var cycleRepository = require('../CARLI/Entity/CycleRepository');
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var vendorDatabases = require('../middleware/components/vendorDatabases');

triggerIndexingForCycles();

async function triggerIndexingForCycles() {
    const cycles = await cycleRepository.list();

    const cycleIds = cycles.map(cycle => cycle.id);

    let finalPromise = cycleIds.reduce((promise, cycleId) => {
        return promise.then(() => indexCycle(cycleId));
    }, Promise.resolve({}))

    await finalPromise;

    process.exit(0);
}

async function indexCycle(cycleId) {
    let waitForJobs = true;

    console.log("Waiting to start indexing cycle " + cycleId);
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 5000);
    })

    while (waitForJobs) {
        let activeJobs = await getActiveJobs();
        let promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 5000);
        });
        await promise;

        activeJobs.forEach(job => {
            console.log(`${job.type} job on ${job.database} is ${job.progress}% complete`);
        });

        waitForJobs = activeJobs.length > 0;
    }

    console.log("Starting indexing cycle " + cycleId);

    return vendorDatabases.triggerIndexingForCycleId(cycleId)
        .catch(err => {
            console.log(`Error indexing cycle ${cycleId}: ${JSON.stringify(err)}`);
        });
}


async function getActiveJobs() {
//response looks like this:
//     [{
//         "changes_done": 64438,
//         "database": "mailbox",
//         "pid": "<0.12986.1>",
//         "progress": 84,
//         "started_on": 1376116576,
//         "total_changes": 76215,
//         "type": "database_compaction",
//         "updated_on": 1376116619
//     }]

    const response = await couchUtils.getRunningCouchJobs();

    return response;
}