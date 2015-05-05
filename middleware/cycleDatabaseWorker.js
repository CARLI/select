
var cluster = require('cluster');
var cycleCreation = require('./components/cycleCreation');

var sourceCycleId = process.env.sourceCycleId;
var newCycleId = process.env.newCycleId;

console.log('Worker started', sourceCycleId, newCycleId);
cycleCreation.copyCycleDataFrom( sourceCycleId, newCycleId ).then(function() {
    cluster.worker.kill();
});
