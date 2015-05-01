
var cluster = require('cluster');
var cycleCreation = require('./components/cycleCreation');

var newCycleId = process.env.newCycleId;
var sourceCycle = process.env.sourceCycle;

console.log('Worker started');
cycleCreation.copyCycleDataFrom( sourceCycle, newCycleId).then(function() {
    cluster.worker.kill();
});
