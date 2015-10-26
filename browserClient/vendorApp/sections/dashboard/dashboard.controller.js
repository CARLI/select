angular.module('vendor.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController($scope, authService, cycleService, emailService, vendorStatusService){
    var vm = this;
    var currentUser = null;
    var cycle = cycleService.getCurrentCycle();
    var computeObjectEqualityDeeply = true;

    vm.flaggedReasonDetailsExpanded = {};
    vm.vendorStatus = null;
    vm.vendorDoneEnteringPrices = false;

    vm.doneEnteringPrices = doneEnteringPrices;
    vm.updateVendorStatus = updateVendorStatus;

    vm.loadingPromise = activate();

    function activate(){
        return authService.fetchCurrentUser()
            .then(function (user) {
                currentUser = user;
                vm.vendor = currentUser.vendor;
            })
            .then(updateVendorFlaggedOfferings)
            .then(loadVendorStatus)
            .then(watchVendorStatusChecklist);
    }

    function loadVendorStatus(){
        return vendorStatusService.getStatusForVendor(vm.vendor.id, cycle)
            .then(function(vendorStatus){
                vm.vendorStatus = vendorStatus;
                checkIfVendorIsDoneEnteringPrices();
            });
    }

    function watchVendorStatusChecklist(){
        return $scope.$watch('vm.vendorStatus.checklist', updateVendorStatus, computeObjectEqualityDeeply);
    }

    function updateVendorStatus(newValue, oldValue){
        if ( !newValue || angular.equals(newValue,oldValue) ){
            return;
        }
        if (vm.statusUpdating) {
            return;
        }
        vm.statusUpdating = true;

        return vendorStatusService.update(vm.vendorStatus, cycle)
            .then(syncData)
            .catch(function(err){
                Logger.log('error updating vendor status', err);
            })
            .finally(function() {
                vm.statusUpdating = false;
                return loadVendorStatus();
            });
    }

    function updateVendorFlaggedOfferings() {
        return vendorStatusService.updateVendorStatusFlaggedOfferings(vm.vendor.id, cycle)
            .then(syncData);
    }

    function syncData(){
        return cycleService.syncDataBackToCarli();
    }

    function doneEnteringPrices(){
        vm.statusUpdating = true;

        return vendorStatusService.updateVendorStatusActivity('Done Entering Prices', vm.vendor.id, cycle)
            .then(notifyCarliThatVendorIsDoneEnteringPrices)
            .then(syncData)
            .then(checkIfVendorIsDoneEnteringPrices)
            .catch(function(err){
                Logger.log('error updating vendor status', err);
            })
            .finally(function() {
                vm.statusUpdating = false;
                return loadVendorStatus();
            });

        function notifyCarliThatVendorIsDoneEnteringPrices(){
            return emailService.sendVendorDoneEnteringPricingMessage(vm.vendor.id);
        }
    }

    function checkIfVendorIsDoneEnteringPrices() {
        vm.vendorDoneEnteringPrices = (vm.vendorStatus.description === 'Done Entering Prices');
    }
}
