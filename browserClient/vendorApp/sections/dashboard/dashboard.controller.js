angular.module('vendor.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController($scope, authService, cycleService, vendorStatusService){
    var vm = this;
    var currentUser = null;
    var cycle = cycleService.getCurrentCycle();
    var computeObjectEqualityDeeply = true;

    vm.vendorStatus = null;

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
            .then(function(){
                return syncData()
                    .then(loadVendorStatus);
            })
            .catch(function(err){
                console.log('error updating vendor status', err);
            })
            .finally(function() {
                vm.statusUpdating = false;
            });
    }

    function syncData(){
        return cycleService.syncDataBackToCarli();
    }
}
