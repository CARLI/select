angular.module('common.vendorStatusService')
    .service('vendorStatusService', vendorStatusService);

function vendorStatusService( CarliModules, $filter, $q, errorHandler ) {

    var vendorStatusModule = CarliModules.VendorStatus;

    return {
        list:   function(cycle) { return $q.when( vendorStatusModule.list(cycle)).catch(errorHandler); },
        create: function() { return $q.when( vendorStatusModule.create.apply(this, arguments) ); },
        update: updateVendorStatus,
        updateVendorStatusActivity: updateVendorStatusActivity,
        updateVendorStatusFlaggedOfferings: updateVendorStatusFlaggedOfferings,
        load:   function() { return $q.when( vendorStatusModule.load.apply(this, arguments) ).catch(errorHandler); },
        getStatusForVendor: getStatusForVendor,
        closePricingForVendor: closePricingForVendor,
        openPricingForVendor: openPricingForVendor
    };

    function updateVendorStatus( vendorStatus, cycle ){
        return $q.when( vendorStatusModule.update(vendorStatus, cycle) );
    }

    function updateVendorStatusActivity( activityMessage, vendorId, cycle ){
        return getStatusForVendor(vendorId, cycle)
            .then(function(vendorStatus){
                vendorStatus.lastActivity = new Date();
                vendorStatus.description = activityMessage;
                return updateVendorStatus(vendorStatus, cycle);
            });
    }

    function updateVendorStatusFlaggedOfferings( flaggedOfferingsCount, flaggedOfferingsReasons, vendorId, cycle ){
        return getStatusForVendor(vendorId, cycle)
            .then(function(vendorStatus){
                vendorStatus.flaggedOfferingsCount = flaggedOfferingsCount;
                vendorStatus.flaggedOfferingsReasons = flaggedOfferingsReasons;
                return updateVendorStatus(vendorStatus, cycle);
            });
    }

    function getStatusForVendor( vendorId, cycle ) {
        return $q.when( vendorStatusModule.getStatusForVendor(vendorId, cycle) )
            .catch(errorHandler);
    }

    function closePricingForVendor( vendorId, cycle ) {
        return getStatusForVendor( vendorId, cycle )
            .then(function( vendorStatus ){
                vendorStatus.isClosed = true;
                return updateVendorStatus(vendorStatus, cycle)
                    .catch(errorHandler);
            });
    }

    function openPricingForVendor( vendorId, cycle ) {
        return getStatusForVendor( vendorId, cycle )
            .then(function( vendorStatus ){
                vendorStatus.isClosed = false;
                return updateVendorStatus(vendorStatus, cycle)
                    .catch(errorHandler);
            });
    }
}
