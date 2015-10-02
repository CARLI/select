
var cluster = require('cluster');

var vendorDatabases = require('./components/vendorDatabases');

Logger.log('Synchronization worker started');

vendorDatabases.syncEverything()
    .then(exitWorker);

function exitWorker() {
    cluster.worker.kill();
}
