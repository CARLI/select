angular.module('common.vendorStatusService')
    .service('vendorStatusService', vendorStatusService);

function vendorStatusService( CarliModules, $q, authService, errorHandler ) {

    var vendorStatusModule = CarliModules.VendorStatus;
    var VendorDatabaseModule = CarliModules.VendorDatabaseMiddleware;

    return {
        list:   function(cycle) { return $q.when( vendorStatusModule.list(cycle)).catch(errorHandler); },
        create: function() { return $q.when( vendorStatusModule.create.apply(this, arguments) ); },
        recordLastVendorLogin: recordLastVendorLogin,
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
                vendorStatus.lastActivity = new Date().toISOString();
                vendorStatus.description = activityMessage;
                vendorStatus.lastActivityUserId = authService.getCurrentUser().id;
                return updateVendorStatus(vendorStatus, cycle);
            });
    }

    function recordLastVendorLogin( vendorId, cycle ){
        return getStatusForVendor(vendorId, cycle)
            .then(function(vendorStatus){
                vendorStatus.lastLoginDate = new Date().toISOString();
                vendorStatus.lastLoginUserId = authService.getCurrentUser().id;
                return updateVendorStatus(vendorStatus, cycle);
            });
    }

    function updateVendorStatusFlaggedOfferings( vendorId, cycle ){
        return $q.when( VendorDatabaseModule.updateFlaggedOfferingsForVendor(vendorId, cycle) )
            .catch(errorHandler);
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
