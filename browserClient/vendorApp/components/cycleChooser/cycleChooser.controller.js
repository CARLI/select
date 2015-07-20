angular.module('vendor.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($scope, alertService, authService, cycleService, vendorStatusService ) {
    var vm = this;

    vm.cycles = [];
    vm.loadingPromise = null;
    vm.vendor = {};

    activate();

    function activate() {
        authService.fetchCurrentUser().then(function (user) {
            vm.vendor = user.vendor;
            vm.loadingPromise = loadCycles();

        });

        $scope.$watch('vm.selectedCycle', readyCycleIfVendorIsStillAllowedIn);
    }

    function loadCycles() {
        return cycleService.listActiveCycles().then(function (cycles) {
            if (cycles.length === 0){
                vm.noActiveCycles = true;
            }
            else if (cycles.length === 1) {
                return readyCycleIfVendorIsStillAllowedIn(cycles[0]);
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
                var isAllowedIn = true;

                if ( vendorStatus && vendorStatus.isClosed ){
                    isAllowedIn = false;
                }

                if ( isAllowedIn ){
                    return updateStatus()
                        .then(warnAboutOtherRecentVendorUsers)
                        .then(readyCycle);
                }
                else {
                    vm.noActiveCycles = true;
                    return false;
                }

                function updateStatus() {
                    return vendorStatusService.updateVendorStatusActivity('Logged in', vm.vendor.id, cycle);
                }

                function readyCycle() {
                    return readySelectedCycle(cycle);
                }
            });

        function warnAboutOtherRecentVendorUsers() {
            var currentUser = authService.getCurrentUser();
            return vendorStatusService
                .getStatusForVendor( currentUser.vendor.id, cycle)
                .then(displayWarningOfRecentActivity);

            function displayWarningOfRecentActivity(status) {
                if (status.lastUserId === currentUser.id) {
                    return status;
                }
                
                var oneHourAgo = moment().subtract(1, 'hour');
                var lastActivity = moment(status.lastActivity);

                if (lastActivity.isAfter(oneHourAgo)) {
                    alertService.putAlert(status.lastUserId + ' was logged in recently');
                }

                return status;
            }
        }
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
