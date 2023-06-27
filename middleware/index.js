var cluster = require('cluster');

process.chdir(__dirname);

var Logger = require('../CARLI/Logger');

var expressWorkerCount = 1; // require('os').cpus().length;
var expressWorkerRespawn = process.env['WORKER_RESPAWN'];
var expressWorkerSetup = { exec: './runExpress.js' };
var cycleDatabaseWorkerSetup = { exec: './cycleDatabaseWorker.js' };
var resumeCycleDatabaseWorkerSetup = { exec: './resumeCycleDatabaseWorker.js' };
var synchronizationWorkerSetup = { exec: './synchronizationWorker.js' };


if (cluster.isMaster) {
    launchWebWorkers();
    relaunchWebWorkers();
    listenForMessages();
}

function launchWebWorkers() {
    cluster.setupMaster(expressWorkerSetup);
    for (var i = 0; i < expressWorkerCount; i += 1) {
        cluster.fork();
    }
}

function relaunchWebWorkers() {
    cluster.on('exit', restartCrashedWorker);

    function restartCrashedWorker(worker) {
        Logger.log('worker '+worker.id+' exited');
        if (expressWorkerRespawn) {
            Logger.log('Worker ' + worker.id + ' died, launching replacement');
            cluster.setupMaster(expressWorkerSetup);
            cluster.fork();
        }
    }
}

function listenForMessages() {
    Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].on('message', dispatchMessage);
    });

    function dispatchMessage(message) {
        if (message.command == 'launchCycleDatabaseWorker') {
            Logger.log('Master is launching cycle database worker');
            launchCycleDatabaseWorker(message.sourceCycleId, message.targetCycleData);
        } else if (message.command == 'launchResumeCycleDatabaseWorker') {
            Logger.log('Master is launching resume-cycle database worker');
            launchResumeCycleDatabaseWorker(message.jobId);
        } else if (message.command == 'launchSynchronizationWorker') {
            Logger.log('Master is launching synchronization worker');
            launchSynchronizationWorker();
        } else {
            Logger.log('Unrecognized message: ' + JSON.stringify(message));
        }
    }
}

function launchCycleDatabaseWorker(sourceCycleId, targetCycleData) {
    cluster.setupMaster(cycleDatabaseWorkerSetup);
    cluster.fork({ sourceCycleId: sourceCycleId, targetCycleData: targetCycleData });
}

function launchResumeCycleDatabaseWorker(jobId) {
    cluster.setupMaster(resumeCycleDatabaseWorkerSetup);
    cluster.fork({ jobId: jobId });
}

function launchSynchronizationWorker() {
    cluster.setupMaster(synchronizationWorkerSetup);
    cluster.fork();
}
