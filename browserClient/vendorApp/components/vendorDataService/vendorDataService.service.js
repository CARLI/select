angular.module('vendor.vendorDataService')
    .service('vendorDataService', vendorDataService);

function vendorDataService(config, cycleService, vendorStatusService) {
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
            if ( cycle.id === config.oneTimePurchaseProductsCycleDocId ){
                console.log('  *One-Time Purchase cycle is always open');
                cycleIsOpen = true;
            }
            return cycleIsOpen;
        }

        function pricingIsStillOpenToVendor(vendorStatus){
            var pricingIsOpenToVendor = (vendorStatus && !vendorStatus.isClosed);
            console.log('  vendor pricing is still open: '+pricingIsOpenToVendor);
            return pricingIsOpenToVendor;
        }

        function userIsActive(){
            //note: This works correctly when the user logs in, but won't work to prevent changes by a user that was
            //      made inactive after they logged in. Unless this were to make a call back to the database to update
            //      the user information.
            console.log('  user is active: '+user.isActive);
            return user.isActive;
        }
    }

    function updateAndSyncVendorStatus(vendorStatus, cycle) {
        return updateVendorStatus(vendorStatus, cycle)
            .then(cycleService.syncDataBackToCarli);
    }
}
