angular.module('carli.sections.deleteCycles')
    .controller('deleteCyclesController', deleteCyclesController);

function deleteCyclesController(cycleService) {
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
        if ( window.confirm('If you strike me down, I will never come back.') ) {
            cycleService.deleteCycle(cycle)
                .then(function(msg) {
                    console.debug(msg);
                });
        }
    }
}
