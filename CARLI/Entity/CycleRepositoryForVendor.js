var baseRepository = require('./CycleRepository');

module.exports = function (vendor) {

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
        setStore: baseRepository.setStore,
        load: loadCycleForVendor,
        statusLabels: baseRepository.statusLabels,
        listActiveCycles: listActiveCyclesForVendor
    };
};
