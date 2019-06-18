var cluster = require('cluster');

process.chdir(__dirname);

var Logger = require('../CARLI/Logger');

var expressWorkerCount = 1; // require('os').cpus().length;
var expressWorkerSetup = { exec: './runExpress.js' };
var cycleDatabaseWorkerSetup = { exec: './cycleDatabaseWorker.js' };
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
        if (!worker.suicide) {
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
            launchCycleDatabaseWorker(message.sourceCycleId, message.newCycleId);
        } else if (message.command == 'launchSynchronizationWorker') {
            Logger.log('Master is launching synchronization worker');
            launchSynchronizationWorker();
        } else {
            Logger.log('Unrecognized message: ' + JSON.stringify(message));
        }
    }
}

function launchCycleDatabaseWorker(sourceCycleId, newCycleId) {
    cluster.setupMaster(cycleDatabaseWorkerSetup);
    cluster.fork({ sourceCycleId: sourceCycleId, newCycleId: newCycleId });
}

function launchSynchronizationWorker() {
    cluster.setupMaster(synchronizationWorkerSetup);
    cluster.fork();
}
