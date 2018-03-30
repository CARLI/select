#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var Q = require('q');

var cli = require('../CARLI/CommandLine');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var libraryStatusRepository = require('../CARLI/Entity/LibraryStatusRepository');


cli.withSingleArgument('cycle-id', resetLibraryStatusesForCycle);

function resetLibraryStatusesForCycle(cycleId) {
    var cycle = null;

    return cli.asCouchAdmin(loadCycleAndResetStatuses);

    function loadCycleAndResetStatuses() {
        return cycleRepository.load(cycleId)
            .then(saveCycle)
            .then(loadLibraryStatusesForCycle)
            .then(resetStatuses)
            .then(saveStatuses)
            .then(logResults)
            .catch(logErrors);
    }

    function saveCycle(loadedCycle) {
        cycle = loadedCycle;
        return loadedCycle;
    }

    function loadLibraryStatusesForCycle(loadedCycle) {
        return libraryStatusRepository.list(loadedCycle);
    }

    function resetStatuses(listOfStatuses) {
        return listOfStatuses.map(libraryStatusRepository.reset);
    }

    function saveStatuses(listOfStatuses) {
        return Q.all(listOfStatuses.map(updateStatus));

        function updateStatus(statusObj) {
            return libraryStatusRepository.update(statusObj, cycle);
        }
    }

    function logResults(qDotAllPromise) {
        console.log('Reset ' + qDotAllPromise.length + ' library statuses');
    }

    function logErrors(error) {
        console.log('Error resetting statuses', error);
    }
}