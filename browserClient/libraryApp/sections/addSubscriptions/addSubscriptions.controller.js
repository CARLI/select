angular.module('library.sections.addSubscriptions')
.controller('addSubscriptionsController', addSubscriptionsController);

function addSubscriptionsController( cycleService, authService, libraryStatusService ){
    var vm = this;

    vm.activeCycle = null;
    vm.chooseCycle = false;
    vm.cycles = [];
    vm.noCycles = false;
    vm.loadingPromise = null;
    vm.userIsReadOnly = authService.userIsReadOnly;

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
        updateLastActivityForCurrentLibrary(cycle);
    }

    function updateLastActivityForCurrentLibrary(cycle) {
        var u = authService.getCurrentUser();
        libraryStatusService.updateLastActivity(u.library.id, cycle);
    }

    function multipleCycles(){
        vm.chooseCycle = true;
        vm.activeCycle = null;
        vm.noCycles = false;
    }

}
