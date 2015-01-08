angular.module('carli.sections.subscriptions')
.controller('subscriptionsController', subscriptionsController);

function subscriptionsController(cycleService){
    var vm = this;

    activate();
    function activate() {
        cycleService.listActiveCycles().then(function(activeCycles) {
            vm.cycles = activeCycles;
        });
    }
}
