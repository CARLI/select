angular.module('vendor.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($scope, $timeout, cycleService) {
    var vm = this;

    vm.cycles = [];

    activate();

    function activate() {
        loadCycles();
        $scope.$watch('vm.selectedCycle', readySelectedCycle);
    }

    function loadCycles() {
        cycleService.listActiveCycles().then(function (cycles) {
            if (cycles.length === 1) {
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
        
        cycle.readyCheck().then(function (isReady) {
            if (!isReady) {
                cycle.createDatabase().then(setCycle);
            } else {
                $scope.$apply(setCycle);
            }
        });

        function setCycle() {
            cycleService.setCurrentCycle(cycle);
        }
    }
}
