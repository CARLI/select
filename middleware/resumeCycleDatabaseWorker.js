var cluster = require('cluster');
const CycleJobQueueManager = require('../CARLI/CycleJobQueueManager');

async function doWork() {
    const jobId = process.env.jobId;
    const queueManager = CycleJobQueueManager();
    await queueManager.resume(jobId);
    exitWorker();
}

doWork();
function exitWorker() {
    cluster.worker.kill();
}
