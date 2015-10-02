angular.module('vendor.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($scope, alertService, authService, config, cycleService, userService, vendorDataService, vendorStatusService ) {
    var vm = this;

    vm.cycles = [];
    vm.loadingPromise = null;
    vm.user = {};
    vm.vendor = {};

    activate();

    function activate() {
        authService.fetchCurrentUser().then(function (user) {
            vm.user = user;
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
        
        return vendorDataService.isVendorAllowedToMakeChangesToCycle(vm.user, cycle)
            .then(function(isAllowedIn){
                if (isAllowedIn) {
                    return warnAboutOtherRecentVendorUsers()
                        .then(readyCycle)
                        .then(updateStatus);
                }
                else {
                    vm.noActiveCycles = true;
                    return false;
                }

                function readyCycle() {
                    return readySelectedCycle(cycle);
                }
                
                function updateStatus() {
                    return vendorStatusService.recordLastVendorLogin(vm.vendor.id, cycle)
                        .then(cycleService.syncDataBackToCarli);
                }
            });

        function warnAboutOtherRecentVendorUsers() {
            var currentUser = authService.getCurrentUser();

            return vendorStatusService
                .getStatusForVendor( currentUser.vendor.id, cycle)
                .then(displayWarningIfRelevant);

            function displayWarningIfRelevant(status) {
                if (warningIsRelevant()) {
                    displayWarning();
                }
                return status;

                function warningIsRelevant() {
                    return lastUserIsNotThisUser() && lastUserIsWithinTimeoutPeriod();

                    function lastUserIsNotThisUser() {
                        return status.lastLoginUserId !== currentUser.id;
                    }

                    function lastUserIsWithinTimeoutPeriod() {
                        var authTimeoutInMilliseconds = config.getAuthTimeoutDuration();
                        var someTimeAgo = moment().subtract(authTimeoutInMilliseconds, 'milliseconds');
                        var lastLogin = moment(status.lastLoginDate);

                        return lastLogin.isAfter(someTimeAgo);
                    }
                }

                function displayWarning() {
                    userService.load(status.lastLoginUserId).then(function (lastUser) {
                        Logger.log(lastUser);
                        alertService.putAlert(lastUser.fullName + 'may be logged in right now. ' +
                          'Confirm that they have logged out before you proceed. ' +
                          'Otherwise, you may overwrite each other\'s entries.');
                    });
                }
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
