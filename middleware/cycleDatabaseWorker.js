var cluster = require('cluster');
const CycleJobQueueManager = require('../CARLI/CycleJobQueueManager');

async function doWork() {
    const sourceCycleId = process.env.sourceCycleId;
    const targetCycleData = process.env.targetCycleData;
    Logger.log('Cycle creation processing', job);

    const queueManager = CycleJobQueueManager();
    await queueManager.start(sourceCycleId, targetCycleData);
    exitWorker();
}

doWork();

function exitWorker() {
    cluster.worker.kill();
}
