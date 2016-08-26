angular.module('carli.sections.subscriptions')
.controller('subscriptionsController', subscriptionsController);

function subscriptionsController(cycleService){
    var vm = this;

    activate();
    function activate() {
        cycleService.listActiveSubscriptionCycles().then(function(activeCycles) {
            vm.cycles = activeCycles.sort(sortActiveCycles);
        });
    }

    function sortActiveCycles(c1, c2) {
        if (c1.year == c2.year)
            return c1.name > c2.name;
        return c1.year < c2.year;
    }
}
