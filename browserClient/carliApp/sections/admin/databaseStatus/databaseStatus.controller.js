angular.module('carli.admin')
    .controller('databaseStatusController', databaseStatusController);

function databaseStatusController($q, cycleService, vendorService) {
    var vm = this;

    vm.vendorsById = {};
    vm.cycles = [];
    vm.cycleStatusByCycleId = {};

    activate();

    function activate() {
        vm.loadingPromise = loadVendors()
            .then(loadCycles)
            .then(loadDatabaseStatuses);
    }

    function loadVendors() {
        return vendorService.list()
            .then(function (vendors) {
                vendors.forEach(function (vendor) {
                    vm.vendorsById[ vendor.id ] = vendor;
                });
                return vendors;
            });
    }

    function loadCycles() {
        return cycleService.list()
            .then(function (cycles) {
                vm.cycles = cycles;
                return cycles;
            });
    }

    function loadDatabaseStatuses(cycles) {
        return $q.all(cycles.map(loadStatusForCycle));

        function loadStatusForCycle(cycle) {
            return cycleService.getCycleDatabaseStatuses(cycle.id).then(function (statuses) {
                vm.cycleStatusByCycleId[cycle.id] = JSON.parse(statuses);
                return true;
            });
        }
    }
}
