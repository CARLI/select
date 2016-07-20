angular.module('carli.sections.dashboard')
    .controller('dashboardController', dashboardController);

function dashboardController($q, cycleService) {
    var vm = this;

    vm.cycles = [];
    vm.cyclesLoading = null;

    vm.totalsByCycle = {};

    activate();

    function activate() {
        vm.cyclesLoading = cycleService.listActiveSubscriptionCycles()
            .then(function (activeCycles) {
                vm.cycles = activeCycles;
                return activeCycles;
            })
            .then(function (cycles) {
                return $q.all(cycles.map(loadTotalsForCycle));
            });

        function loadTotalsForCycle(cycle) {
            return cycle.getCycleSelectionAndInvoiceTotals()
                .then(function (cycleTotals) {
                    vm.totalsByCycle[cycle.id] = cycleTotals;
                });
        }
    }
}
