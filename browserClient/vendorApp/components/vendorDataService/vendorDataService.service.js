angular.module('vendor.vendorDataService')
    .service('vendorDataService', vendorDataService);

function vendorDataService(cycleService, vendorStatusService) {
    return {
        isVendorAllowedToMakeChangesToCycle: isVendorAllowedToMakeChangesToCycle
    };

    function isVendorAllowedToMakeChangesToCycle(user, cycle) {
        var vendor = user.vendor;

        return vendorStatusService.getStatusForVendor(vendor.id, cycle)
            .then(function (vendorStatus) {
                return cycleIsOpenToVendorsForPricing() &&
                       pricingIsStillOpenToVendor(vendorStatus) &&
                       userIsActive();
            });

        function cycleIsOpenToVendorsForPricing(){
            return cycle.cycleStatus === cycleService.CYCLE_STATUS_VENDOR_PRICING;
        }

        function pricingIsStillOpenToVendor(vendorStatus){
            return !vendorStatus.isClosed;
        }

        function userIsActive(){
            return user.isActive;
        }
    }
}