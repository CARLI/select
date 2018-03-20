#!/usr/bin/env node

var path = require('path');

var cli = require('../CARLI/CommandLine');
var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var cycleCreationModule = require('../middleware/components/cycleCreation');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var Q = require('q');


cli.asCouchAdmin(deleteTestCycles);

/*
cli.asCouchAdmin(makeTestCycles)
    .then(function(){
        return cli.asCouchAdmin(deleteTestCycles);
    })
    .then(function(){
        process.exit();
    });
*/

const maxCyclesToCreate = 40;

function createCycle(cycleProperties) {
    var cycleData = {
        name: cycleProperties.name,
        cycleType: 'Fiscal Year',
        databaseName: couchUtils.makeValidCouchDbName('cycle-test-' + cycleProperties.name),
        year: cycleProperties.year,
        status: 0,
        isArchived: false
    };

    return cycleCreationModule.create(cycleData);
}

function deleteTestCycles() {
    return cycleRepository.list()
        .then(keepTestCycles)
        .then(mapToCycleIds)
        .then(limitNumber)
        .then(deleteCycles)
        .then(reportDone);

    function keepTestCycles(listOfCycles) {
        return listOfCycles.filter(function (cycle) {
            return cycle.name.indexOf('Test Cycle') === 0;
        });
    }

    function mapToCycleIds(listOfCyclesToDelete) {
        return listOfCyclesToDelete.map(function (cycle) {
            return cycle.id
        });
    }

    function limitNumber(list) {
        return list.slice(0, maxCyclesToCreate);
    }

    function deleteCycles(cycleIds) {
        console.log('delete cycles', cycleIds);
        return Q.all(cycleIds.map(cycleCreationModule.deleteCycle));
    }

    function reportDone() {
        console.log('Done deleting cycles');
    }
}

function makeTestCycles() {
    var cycleData = [];

    for (var i = 0; i < maxCyclesToCreate; i++) {
        cycleData.push({
            name: 'Test Cycle ' + i,
            year: 1000 + i
        });
    }

    return Q.all(cycleData.map(createCycle))
        .then(function () {
            console.log('Done making cycles');
        });
}

