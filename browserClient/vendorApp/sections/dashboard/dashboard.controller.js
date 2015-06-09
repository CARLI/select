angular.module('vendor.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController($scope, cycleService, userService, vendorStatusService){
    var vm = this;
    var currentUser = userService.getUser();
    var cycle = cycleService.getCurrentCycle();
    var computeObjectEqualityDeeply = true;

    vm.vendorStatus = null;

    vm.updateVendorStatus = updateVendorStatus;

    activate();


    function activate(){
        vm.vendor = currentUser.vendor;
        loadVendorStatus()
            .then(watchVendorStatusChecklist);
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

    function updateVendorStatus(value){
        if ( !value ){
            return;
        }

        return vendorStatusService.update(vm.vendorStatus, cycle)
            .then(function(){
                console.log('vendor status updated');
                return loadVendorStatus();
            })
            .catch(function(err){
                console.log('error updating vendor status', err);
            });
    }
}
