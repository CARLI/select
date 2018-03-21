angular.module('carli.sections.deleteCycles')
    .controller('deleteCyclesController', deleteCyclesController);

function deleteCyclesController(alertService, cycleService) {
    var vm = this;
    vm.deleteCycle = deleteCycle;

    activate();

    function activate() {
        cycleService.listActiveSubscriptionCycles().then(function (activeCycles) {
            vm.cycles = activeCycles.sort(sortActiveCycles);
        });
    }

    function sortActiveCycles(c1, c2) {
        if (c1.year == c2.year)
            return c1.name > c2.name;
        return c1.year < c2.year;
    }

    function deleteCycle(cycle) {
        if ( window.confirm('Are you sure you want to delete ' + cycle.name) ) {
            return cycleService.deleteCycle(cycle)
                .then(function(msg) {
                    alertService.putAlert('Cycle deleted', {severity: 'success'});
                    removeDeletedCycleFromList(cycle);
                });
        }
    }

    function removeDeletedCycleFromList(cycle) {
        vm.cycles = vm.cycles.filter(function(c) {
            return c !== cycle;
        });
    }
}
