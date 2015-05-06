angular.module('carli.admin')
    .controller('databaseStatusController', databaseStatusController);

function databaseStatusController($q, cycleService, vendorService) {
    var vm = this;

    vm.vendors = {};
    vm.cycles = {};
    vm.cycleStatuses = [];

    activate();

    function activate() {
        vm.loadingPromise = $q.all([
            loadCycles(),
            loadVendors(),
            loadDatabaseStatuses()
        ]);
    }

    function loadCycles() {
        return cycleService.list()
            .then(function (cycles) {
                cycles.forEach(function (cycle) {
                    vm.cycles[ cycle.id ] = cycle;
                });
                return true;
            });
    }
    function loadVendors() {
        return vendorService.list()
            .then(function (vendors) {
                vendors.forEach(function (vendor) {
                    vm.vendors[ vendor.id ] = vendor;
                });
                return true;
            });
    }

    function loadDatabaseStatuses() {
        return cycleService.getCycleDatabaseStatuses().then(function (statuses) {
            vm.cycleStatuses = JSON.parse(statuses);
            return true;
        });
    }
}
