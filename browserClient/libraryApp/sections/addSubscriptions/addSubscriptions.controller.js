angular.module('library.sections.addSubscriptions')
.controller('addSubscriptionsController', addSubscriptionsController);

function addSubscriptionsController( cycleService ){
    var vm = this;

    vm.activeCycle = null;
    vm.chooseCycle = false;
    vm.cycles = [];
    vm.noCycles = false;
    vm.loadingPromise = null;

    vm.resetCycleChoice = multipleCycles;
    vm.setCycle = oneCycle;

    activate();

    function activate(){
        vm.loadingPromise = loadCycles();
        return vm.loadingPromise;
    }

    function loadCycles(){
        return cycleService.listOpenForSelectionsAndClosedCycles()
            .then(function(cycles){
                vm.cycles = cycles;

                if ( cycles.length === 0 ){
                    noCycles();
                }
                else if ( cycles.length === 1 ){
                    oneCycle(cycles[0]);
                }
                else {
                    multipleCycles();
                }
            });
    }

    function noCycles(){
        vm.chooseCycle = false;
        vm.activeCycle = null;
        vm.noCycles = true;
    }

    function oneCycle(cycle){
        vm.chooseCycle = false;
        vm.activeCycle = cycle;
        vm.noCycles = false;

        cycleService.setCurrentCycle(cycle);
    }

    function multipleCycles(){
        vm.chooseCycle = true;
        vm.activeCycle = null;
        vm.noCycles = false;
    }

}