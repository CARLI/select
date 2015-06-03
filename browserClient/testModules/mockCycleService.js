angular.module('carli.mockCycleService', [])
    .factory('mockCycleService', function mockCycleService($q) {

        return {
            cycleDefaults: noOp,
            list: promiseNoOp,
            listActiveCycles: promiseNoOp,
            listActiveCyclesOfType: promiseNoOp,
            listActiveSubscriptionCycles: promiseNoOp,
            create: promiseNoOp,
            createCycleFrom: promiseNoOp,
            getCycleCreationStatus: promiseNoOp,
            getCycleDatabaseStatuses: promiseNoOp,
            update: promiseNoOp,
            load:   promiseNoOp,
            getCurrentCycle: noOp,
            setCurrentCycle: noOp,
            initCurrentCycle: noOp,
            syncDataToVendorDatabase: promiseNoOp,
            syncDataToAllVendorDatabases: promiseNoOp,
            syncDataToAllVendorDatabasesForCycle: promiseNoOp
        };

        function noOp(){}

        function promiseNoOp(){
            return $q.when([]);
        }
    });
