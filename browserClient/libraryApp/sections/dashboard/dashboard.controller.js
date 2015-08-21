angular.module('library.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController( cycleService, userService ){
    var vm = this;

    vm.cycles = [];
    vm.library = {};
    vm.loadingPromise = null;
    vm.cycleForUnselectedProducts = null;

    vm.viewUnselectedProductsFor = viewUnselectedProductsFor;

    activate();


    function activate(){
        vm.library = userService.getUser().library;

        vm.loadingPromise = cycleService.listNonArchivedClosedCyclesIncludingOneTimePurchase().then(function(cycleList){
            vm.cycles = cycleList;
        });
    }

    function viewUnselectedProductsFor(cycle){
        console.log('view unselected products ',cycle.name);
        vm.cycleForUnselectedProducts = cycle;
    }
}
