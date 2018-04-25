#!/usr/bin/env node

var _ = require('lodash');
var Q = require('q');
var cli = require('../CARLI/CommandLine');

var vendorDatabases = require('../middleware/components/vendorDatabases');


cli.withSingleArgument('cycle-id', resetLibraryStatusesForCycle);

function resetLibraryStatusesForCycle(cycleId) {
    return cli.asCouchAdmin(createVendorDatabaseForCycleArg);

    function createVendorDatabaseForCycleArg() {
        return vendorDatabases.createVendorDatabasesForCycle(cycleId)
            .then(function(){
                console.log('Done creating databases');
            });
    }
}