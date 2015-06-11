angular.module('library.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($scope, appState, cycleService) {
    var vm = this;

    vm.cycles = [];

    activate();

    function activate() {
        loadCycles();
        $scope.$watch('vm.selectedCycle', readySelectedCycle);
    }

    function loadCycles() {
        cycleService.listOpenForSelectionsCycles().then(function (cycles) {
            if (cycles.length === 0){
                vm.noActiveCycles = true;
            }
            else if (cycles.length === 1) {
                readySelectedCycle(cycles[0]);
            } else {
                vm.cycles = cycles;
            }
        });
    }

    function readySelectedCycle(cycle) {
        if (!cycle) {
            return;
        }

        cycleService.setCurrentCycle(cycle);
        appState.setCycle(cycle);
    }
}
