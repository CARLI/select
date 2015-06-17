angular.module('library.sections.addSubscriptions')
.controller('subscriptionSelectionsController', addSubscriptionsController);

function addSubscriptionsController( $q, $routeParams, cycleService, userService ){
    var vm = this;

    vm.activeCycle = null;
    vm.cycle = null;
    vm.chooseCycle = false;
    vm.noCycles = false;
    vm.libraryId = userService.getUser().library.id;
    vm.loadingPromise = null;


    activate();

    function activate(){
        vm.loadingPromise = getCycleForRouteParameter();
        return vm.loadingPromise;
    }

    function getCycleForRouteParameter(){
        var cycleId = $routeParams.cycleId;
        return cycleService.load(cycleId);
    }
}
