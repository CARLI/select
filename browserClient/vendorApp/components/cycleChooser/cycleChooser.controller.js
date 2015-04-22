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
                cycle.prepare().then(setCycle);
            } else {
                $scope.$apply(setCycle);
            }
        });


        // This does not work, because there is a delay between firing off the replication
        // and the job appearing in the job list.  Therefore, the value of 100% is always
        // received on the first call to getReplicationProgress()
        function watchProgress() {
            cycle.getReplicationProgress().then(function(progress) {
                console.log(progress); // TODO progress indicator

                // TODO the progress will never reach 100%
                // The progress reported by Couch corresponds to the full size of the source database,
                // so when it is filtered it will max out at whatever percentage of the documents actually
                // belong to the vendor in question.
                if (progress < 100) {
                    $timeout(watchProgress, 500);
                } else {
                    // TODO fire off indexing and wait for that too
                    $scope.$apply(setCycle);
                }
            });
        }

        function setCycle() {
            cycleService.setCurrentCycle(cycle);
        }
    }
}
