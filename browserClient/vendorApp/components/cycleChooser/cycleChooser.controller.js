angular.module('vendor.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($scope, cycleService) {
    var vm = this;

    vm.cycles = [];

    activate();

    function activate() {
        loadCycles();
        $scope.$watch('vm.selectedCycle', setSelectedCycle);
    }

    function loadCycles() {
        cycleService.listActiveCycles().then(function (cycles) {
            if (cycles.length === 1) {
                setSelectedCycle(cycles[0]);
            } else {
                vm.cycles = cycles;
            }
        });
    }

    function setSelectedCycle(cycle) {
        if (cycle) {
            cycleService.setCurrentCycle(cycle);
        }
    }
}
