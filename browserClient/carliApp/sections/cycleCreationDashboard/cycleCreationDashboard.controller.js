angular.module('carli.sections.subscriptions')
    .controller('cycleCreationDashboardController', cycleCreationDashboardController);

function cycleCreationDashboardController($scope, activityLogService, alertService, cycleService, errorHandler, persistentState) {
    var vm = this;
    vm.cyclesLoading = null;

    vm.activeCycles = [];
    vm.archivedCycles = [];
    vm.cycleBeingEdited = null;
    vm.cycleClosed = cycleService.CYCLE_STATUS_CLOSED;

    activate();
    function activate() {
        vm.cyclesLoading = cycleService.list()
            .then(function (allCycles) {
                var active = [];
                var archived = [];
                var ignored = [];

                allCycles.forEach(function (cycle) {
                    if ( cycle.cycleType === 'One-Time Purchase' )
                        ignored.push(cycle);
                    else if ( cycle.isArchived )
                        archived.push(cycle);
                    else
                        active.push(cycle);
                });

                vm.activeCycles = active.sort(cyclesByYearAndName);
                vm.archivedCycles = archived.sort(cyclesByYearAndName);
            });

        return vm.cyclesLoading;
    }

    function cyclesByYearAndName(c1, c2) {
        if (c1.year == c2.year)
            return c1.name > c2.name;
        return c1.year < c2.year;
    }
}
