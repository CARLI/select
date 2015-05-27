angular.module('vendor.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($scope, cycleService, userService, vendorStatusService ) {
    var vm = this;

    vm.cycles = [];
    vm.loadingPromise = null;
    vm.vendor = {};

    activate();

    function activate() {
        var currentUser = userService.getUser();
        vm.vendor = currentUser.vendor;

        vm.loadingPromise = loadCycles();
        $scope.$watch('vm.selectedCycle', readyCycleIfVendorIsStillAllowedIn);
    }

    function loadCycles() {
        return cycleService.listActiveCycles().then(function (cycles) {
            if (cycles.length === 0){
                vm.noActiveCycles = true;
            }
            else if (cycles.length === 1) {
                return readyCycleIfVendorIsStillAllowedIn(cycles[0])
            } else {
                vm.cycles = cycles;
            }
        });
    }

    function readyCycleIfVendorIsStillAllowedIn( cycle ){
        if (!cycle) {
            return;
        }
        
        return vendorStatusService.getStatusForVendor( vm.vendor.id, cycle )
            .then(function(vendorStatus){
                var isAllowedIn = !vendorStatus.isClosed;

                if ( isAllowedIn ){
                    return readySelectedCycle(cycle);
                }
                else {
                    vm.noActiveCycles = true;
                    return false;
                }
            });
    }

    function readySelectedCycle(cycle) {
        if (!cycle) {
            return;
        }

        return cycle.databaseExists().then(function (isReady) {
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
