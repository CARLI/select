angular.module('vendor.cycleChooser')
    .controller('cycleChooserController', cycleChooserController);

function cycleChooserController($q, $scope, alertService, authService, config, cycleService, productService, userService, vendorDataService, vendorStatusService, persistentState ) {
    var vm = this;

    vm.cycles = [];
    vm.loadingPromise = null;
    vm.user = {};
    vm.vendor = {};
    vm.noActiveCycles = false;

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
        var persistedCycle = persistentState.getCurrentCycle();

        return listCyclesVendorCanWorkWith().then(tryToPickOneAutomatically);

        function tryToPickOneAutomatically(cycles) {

            if (cycles.length === 0){
                vm.noActiveCycles = true;
                return $q.when(false);
            }
            vm.noActiveCycles = false;

            if (canRestorePersistedCycle()) {
                var hydratedCycle = getRestoredPersistedCycle();
                return readyCycleIfVendorIsStillAllowedIn(hydratedCycle);
            }

            if (cycles.length === 1) {
                return readyCycleIfVendorIsStillAllowedIn(cycles[0]);
            }

            persistentState.clearCurrentCycle();
            vm.cycles = cycles;

            function canRestorePersistedCycle() {
                return !!getRestoredPersistedCycle();
            }

            function getRestoredPersistedCycle() {
                if (!persistedCycle) {
                    return false;
                }

                var persistedCycleReducer = makeReducerToFindCycleWithId(persistedCycle.id);
                return cycles.reduce(persistedCycleReducer);
            }
        }
    }

    function makeReducerToFindCycleWithId(idToCheckFor) {
        return function (alreadyFound, nextOneToCheck) {
            if (alreadyFound) {
                return alreadyFound;
            }
            if (nextOneToCheck.id === idToCheckFor) {
                return nextOneToCheck;
            }
            return null;
        };
    }

    function readyCycleIfVendorIsStillAllowedIn( cycle ){
        if (!cycle) {
            return;
        }

        return vendorDataService.isVendorAllowedToMakeChangesToCycle(vm.user, cycle)
            .then(function(isAllowedIn){
                if ( isAllowedIn ){
                    return doesVendorHaveProductsInCycle(cycle);
                }
                else {
                    return false;
                }
            })
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
                        alertService.putAlert(lastUser.fullName + ' may be logged in right now. ' +
                          'Confirm that they have logged out before you proceed. ' +
                          'Otherwise, you may overwrite each other\'s entries.');
                    });
                }
            }
        }
    }

    function listCyclesVendorCanWorkWith(){
        var allCycles = [];

        return cycleService.listActiveCycles()
            .then(function(activeCycles){
                allCycles = activeCycles;
                var productsInCycle = {};

                activeCycles.forEach(function(cycle){
                    productsInCycle[cycle.id] = doesVendorHaveProductsInCycle(cycle);
                });

                return $q.all(productsInCycle);
            })
            .then(function(vendorHasProductsInCycle){
                return allCycles.filter(function(cycle){
                    return vendorHasProductsInCycle[cycle.id];
                });
            });
    }

    function doesVendorHaveProductsInCycle(cycle) {
        return productService.listProductsWithOfferingsForVendorId(vm.vendor.id, cycle)
            .then(function (products) {
                var vendorHasProducts = !!products.length;
                console.log('  vendor has products in ' + cycle.name + ': '+vendorHasProducts+' ('+products.length+')');
                return vendorHasProducts;
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
