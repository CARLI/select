#!/usr/bin/env node

var path = require('path');

var cli = require('../CARLI/CommandLine');
var cycleRepository = require('../CARLI/Entity/CycleRepository');

cli.asCouchAdmin(listCycles);

function listCycles() {
    return cycleRepository.list()
        .then(sortCycles)
        .then(printCycles)
        .then(debugDump);

    var cycleToInspect = "";

    function debugDump() {
        var cycle = cycleToInspect;
        return cycleRepository.listPastFourCyclesMatchingCycle(cycle)
            .then(output => output.map(c => console.log(c.name)))
            .catch(err => console.log("ERR", err));
    }
    function sortCycles(cycles) {
        return cycles.sort(sortByActiveThenStatus);

        function sortByActiveThenStatus(a, b) {
            return (activeStatusIsTheSame()) ? sortByStatus() : sortByActive();

            function activeStatusIsTheSame() { return a.isArchived == b.isArchived; }
            function sortByStatus() { return a.status < b.status; }
            function sortByActive() { return a.isArchived < b.isArchived; }
        }
    }
    function printCycles(cycles) {
        printTabDelimited([ padRight('id', 36), padRight('name', 20), 'status', 'active' ]);
        cycles.forEach(printCycle);

        function printCycle(cycle) {
            // printTabDelimited([ cycle.id, cycle.name, cycle.status, !cycle.isArchived ]);
            if (cycle.name === "Fiscal Year 2019") {
                console.log("found match");
                cycleToInspect = cycle;
            }
        }
    }
}

function printTabDelimited(array) {
    console.log(array.join("\t"));
}

function padRight(str, width) {
    for (var i = str.length; i < width; i++) {
        str += ' ';
    }
    return str;
}

