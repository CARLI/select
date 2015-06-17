angular.module('library.sections.addSubscriptions')
.controller('addSubscriptionsController', addSubscriptionsController);

function addSubscriptionsController( $q, $routeParams, cycleService, userService ){
    var vm = this;

    vm.activeCycle = null;
    vm.chooseCycle = false;
    vm.cycles = [];
    vm.noCycles = false;
    vm.libraryId = userService.getUser().library.id;
    vm.loadingPromise = null;

    vm.setCycle = oneCycle;

    activate();

    function activate(){
        vm.loadingPromise = loadCycles();
        return vm.loadingPromise;
    }

    function loadCycles(){
        return cycleService.listOpenForSelectionsAndClosedCycles()
            .then(function(cycles){
                if ( cycles.length === 0 ){
                    noCycles();
                }
                else if ( cycles.length === 1 ){
                    oneCycle(cycles[0]);
                }
                else {
                    multipleCycles(cycles);
                }
            });
    }

    function noCycles(){
        vm.cycles = [];
        vm.chooseCycle = false;
        vm.activeCycle = null;
        vm.noCycles = true;
    }

    function oneCycle(cycle){
        vm.cycles = [];
        vm.chooseCycle = false;
        vm.activeCycle = cycle;
        vm.noCycles = false;
    }

    function multipleCycles(cycleList){
        vm.cycles = cycleList;
        vm.chooseCycle = true;
        vm.activeCycle = null;
        vm.noCycles = false;
    }

}
