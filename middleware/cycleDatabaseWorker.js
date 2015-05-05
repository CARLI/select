
var cluster = require('cluster');
var cycleCreation = require('./components/cycleCreation');

var sourceCycleId = process.env.sourceCycleId;
var newCycleId = process.env.newCycleId;

console.log('Worker started', sourceCycleId, newCycleId);
cycleCreation.copyCycleDataFrom( sourceCycleId, newCycleId )
    .then(cycleCreation.createVendorDatabases)
    .then(exitWorker)
    .catch(function (err) {
        console.log('Cycle creation failed', err);
    });

function exitWorker() {
    cluster.worker.kill();
}
