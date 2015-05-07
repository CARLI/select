
var cluster = require('cluster');

var vendorDatabases = require('./components/vendorDatabases');

console.log('Synchronization worker started');

vendorDatabases.syncEverything()
    .then(exitWorker);

function exitWorker() {
    cluster.worker.kill();
}
