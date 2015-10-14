angular.module('vendor.vendorDataService')
    .service('vendorDataService', vendorDataService);

function vendorDataService(cycleService, vendorStatusService) {
    return {
        isVendorAllowedToMakeChangesToCycle: isVendorAllowedToMakeChangesToCycle,
        updateAndSyncVendorStatus: updateAndSyncVendorStatus
    };

    function isVendorAllowedToMakeChangesToCycle(user, cycle) {
        console.log('Checking vendor permissions for '+cycle.name);
        var vendor = user.vendor;

        return vendorStatusService.getStatusForVendor(vendor.id, cycle)
            .then(function (vendorStatus) {
                return cycleIsOpenToVendorsForPricing() &&
                       pricingIsStillOpenToVendor(vendorStatus) &&
                       userIsActive();
            });

        function cycleIsOpenToVendorsForPricing(){
            var cycleIsOpen = (cycle.status == cycleService.CYCLE_STATUS_VENDOR_PRICING);
            console.log('  cycle is open to vendors for pricing: '+cycleIsOpen);
            return cycleIsOpen;
        }

        function pricingIsStillOpenToVendor(vendorStatus){
            var pricingIsOpenToVendor = (vendorStatus && !vendorStatus.isClosed);
            console.log('  vendor pricing is still open: '+pricingIsOpenToVendor);
            return pricingIsOpenToVendor;
        }

        function userIsActive(){
            console.log('  user is active: '+user.isActive);
            return user.isActive;
        }
    }

    function updateAndSyncVendorStatus(vendorStatus, cycle) {
        return updateVendorStatus(vendorStatus, cycle)
            .then(cycleService.syncDataBackToCarli);
    }
}
