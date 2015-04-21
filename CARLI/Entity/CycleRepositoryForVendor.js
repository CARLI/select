var baseRepository = require('./CycleRepository');
var couchUtils = require('../Store/CouchDb/Utils');

module.exports = function (vendor) {

    function createDatabaseForVendor(cycleId) {
        return loadCycleForVendor(cycleId).then(function (cycle){
            var sourceCycleDatabaseName = cycle.databaseName;
            var targetCycleDatabaseName = cycle.getDatabaseName();

            return couchUtils.createDatabase(targetCycleDatabaseName)
                .then(startReplication)
                .then(returnCycleId);

            function startReplication() {
                return couchUtils.startVendorDatabaseReplication(sourceCycleDatabaseName, targetCycleDatabaseName, vendor.id);
            }

            function returnCycleId() {
                return cycleId;
            }
        });
    }

    function loadCycleForVendor(cycleId) {
        return baseRepository.load(cycleId).then(overrideBaseMethods);

        function overrideBaseMethods(cycle) {
            Object.keys(functionsToAdd).forEach(function (methodName) {
                cycle[methodName] = functionsToAdd[methodName];
            });
            return cycle;
        }
    }
    function listActiveCyclesForVendor() {
        return baseRepository.listActiveCycles().then(function(cycleList){
            return cycleList
                .filter(findOpenToVendorCycles)
                .filter(findCyclesWithProductsFromVendor);

            function findOpenToVendorCycles(cycle){
                return cycle.status === 2;
            }

            function findCyclesWithProductsFromVendor(cycle) {
                return true; //TODO
            }
        });
    }

    var functionsToAdd = {
        getDatabaseName: function() {
            return this.databaseName + '-' + vendor.id;
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
