angular.module('vendor.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController($scope, authService, cycleService, userService, vendorStatusService){
    var vm = this;
    var currentUser = null;
    var cycle = cycleService.getCurrentCycle();
    var computeObjectEqualityDeeply = true;

    vm.vendorStatus = null;
    vm.vendorDoneEnteringPrices = false;

    vm.doneEnteringPrices = doneEnteringPrices;
    vm.updateVendorStatus = updateVendorStatus;

    activate();


    function activate(){
        authService.fetchCurrentUser().then(function (user) {
            currentUser = user;
            vm.vendor = currentUser.vendor;
            loadVendorStatus()
                .then(watchVendorStatusChecklist);
        });
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
                console.log('error updating vendor status', err);
            })
            .finally(function() {
                vm.statusUpdating = false;
                return loadVendorStatus();
            });
    }

    function syncData(){
        return cycleService.syncDataBackToCarli();
    }

    function doneEnteringPrices(){
        var vendorId = userService.getUser().vendor.id;
        vm.statusUpdating = true;

        return vendorStatusService.updateVendorStatusActivity('Done Entering Prices', vendorId, cycle)
            .then(syncData)
            .then(checkIfVendorIsDoneEnteringPrices)
            .catch(function(err){
                console.log('error updating vendor status', err);
            })
            .finally(function() {
                vm.statusUpdating = false;
                return loadVendorStatus();
            });
    }

    function checkIfVendorIsDoneEnteringPrices() {
        vm.vendorDoneEnteringPrices = (vm.vendorStatus.description === 'Done Entering Prices');
    }
}
