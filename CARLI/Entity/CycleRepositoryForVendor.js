var baseRepository = require('./CycleRepository');
var couchUtils = require('../Store/CouchDb/Utils')();

module.exports = function (vendor) {

    function createDatabaseForVendor(cycleId) {
        return loadCycleForVendor(cycleId).then(function (cycle){
            var targetCycleDatabaseName = cycle.getDatabaseName();

            return couchUtils.doesDatabaseExist(targetCycleDatabaseName)
                .then(createDatabaseIfNotExists)
                .then(returnCycleId);

            function createDatabaseIfNotExists(databaseExists) {
                if (!databaseExists) {
                    return couchUtils.createDatabase(targetCycleDatabaseName);
                } else {
                    return cycleId;
                }
            }

            function returnCycleId() {
                return cycleId;
            }
        });
    }

    function loadCycleForVendor(cycleId) {
        return baseRepository.load(cycleId)
            .then(overrideBaseMethods);
    }

    function listActiveCyclesForVendor() {
        return baseRepository.listActiveCycles().then(function(cycleList){
            return cycleList
                .filter(findOpenToVendorCycles)
                .filter(findCyclesWithProductsFromVendor)
                .map(overrideBaseMethods);

            function findOpenToVendorCycles(cycle){
                return cycle.status === 2;
            }

            function findCyclesWithProductsFromVendor(cycle) {
                return true; //TODO
            }
        });
    }

    function overrideBaseMethods(cycle) {
        Object.keys(functionsToAdd).forEach(function (methodName) {
            cycle[methodName] = functionsToAdd[methodName];
        });
        return cycle;
    }

    var functionsToAdd = {
        getDatabaseName: function() {
            return this.databaseName + '-' + vendor.id;
        },
        getSourceDatabaseName: function() {
            return this.databaseName;
        },
        createDatabase: function createDatabase() {
            return createDatabaseForVendor(this.id);
        },
        databaseExists: function databaseExists() {
            return couchUtils.doesDatabaseExist(this.getDatabaseName());
        },
        replicateFromSource: function replicateFromSource() {
            return couchUtils.replicateForVendor(vendor.id).from(this.getSourceDatabaseName()).to(this.getDatabaseName());
        },
        replicateToSource: function replicateToSource() {
            return couchUtils.replicateForVendor(vendor.id).from(this.getDatabaseName()).to(this.getSourceDatabaseName());
        }
    };

    return {
        createDatabase: createDatabaseForVendor,
        load: loadCycleForVendor,
        statusLabels: baseRepository.statusLabels,
        listActiveCycles: listActiveCyclesForVendor,
        vendor: vendor
    };
};
