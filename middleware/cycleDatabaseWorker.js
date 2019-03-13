
var cluster = require('cluster');
var cycleCreation = require('./components/cycleCreation');
var vendorDatabases = require('./components/vendorDatabases');

var sourceCycleId = process.env.sourceCycleId;
var newCycleId = process.env.newCycleId;

Logger.log('Cycle database worker started', sourceCycleId, newCycleId);

cycleCreation.copyCycleDataFrom( sourceCycleId, newCycleId )
    .then(vendorDatabases.replicateDataToVendorsForCycle)
    .then(vendorDatabases.triggerIndexingForCycleId)
    .then(exitWorker)
    .catch(function (err) {
        Logger.log('Cycle creation failed', err);
    });

function exitWorker() {
    cluster.worker.kill();
}
