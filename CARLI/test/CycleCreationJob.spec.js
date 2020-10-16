var chai = require('chai');
var expect = chai.expect;
var cycleCreationJobRepository = require('../Entity/CycleCreationJobRepository');
var test = require('./Entity/EntityInterface.spec');
var testUtils = require('./utils');

testUtils.setupTestDb();

function validCycleCreationJobData() {
    return {
        type: 'CycleCreationJob',
        sourceCycle: 'sourceCycle',
        targetCycle: 'targetCycle',
        logMessages: []
    };
}

function invalidCycleCreationJobData() {
    return {
        type: 'CycleCreationJob'
    };
}

test.run('CycleCreationJob', validCycleCreationJobData, invalidCycleCreationJobData);

