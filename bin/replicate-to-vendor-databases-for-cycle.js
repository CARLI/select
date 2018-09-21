#!/usr/bin/env node

var _ = require('lodash');
var Q = require('q');
var cli = require('../CARLI/CommandLine');

var vendorDatabases = require('../middleware/components/vendorDatabases');


cli.withSingleArgument('cycle-id', replicateToVendorDatabases);

function replicateToVendorDatabases(cycleId) {
    return cli.asCouchAdmin(replicateVendorDatabaseForCycleArg);

    function replicateVendorDatabaseForCycleArg() {
        return vendorDatabases.replicateDataToVendorsForCycle(cycleId)
            .then(function(){
                console.log('Done replicating databases');
            });
    }
}