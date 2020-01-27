
var cluster = require('cluster');

var databaseAuth = require('../CARLI/DatabaseAuth');
var vendorDatabases = require('./components/vendorDatabases');

Logger.log('Synchronization worker started');

databaseAuth.asCouchAdmin(vendorDatabases.syncEverything)
    .then(exitWorker)
    .catch((err) => {
        console.log("Synchronization worker failed", err);
    });

function exitWorker() {
    cluster.worker.kill();
}
