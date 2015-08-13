angular.module('common.activityLogService')
    .service('activityLogService', activityLogService);

function activityLogService( CarliModules, $q, cycleService, errorHandler, userService ) {

    var activityLogModule = CarliModules.ActivityLog;

    return {
        logActivity: logActivity,
        listActivityBetween: listActivityBetween,
        listActivitySince: listActivitySince,
        logCycleUpdate: logCycleUpdate,
        logEntityAdded: logEntityAdded,
        logEntityModified: logEntityModified,
        logOfferingModified: logOfferingModified,
        logOtpPurchase: logOtpPurchase,
        logOtpPurchaseCancelled: logOtpPurchaseCancelled,
        logLibrarySelectedProduct: logLibrarySelectedProduct,
        logLibraryRemovedProduct: logLibraryRemovedProduct

    };

    function logActivity( activityLog ){
        var user = userService.getUser();

        activityLog.date = new Date().toISOString();
        activityLog.userName = user.name;
        activityLog.userEmail = user.email;

        return $q.when(activityLogModule.create(activityLog))
            .catch(errorHandler);
    }

    function listActivityBetween(startDate, endDate){
        return $q.when( activityLogModule.listActivityBetween(startDate, endDate) )
            .catch(errorHandler);
    }

    function listActivitySince(date){
        return $q.when( activityLogModule.listActivitySince(date) )
            .catch(errorHandler);
    }

    function logCycleUpdate(cycle){
        return logActivity({
            cycleId: cycle.id,
            cycleName: cycle.name,
            actionDescription: 'Transitioned the cycle to '+cycleService.getLabelForCycleStatus(cycle.status),
            app: 'staff',
            category: 'cycleStatus'
        });
    }

    function logEntityAdded(entity){
        var activity = {
            actionDescription: description(),
            app: 'staff',
            category: 'staffAdded'
        };

        addEntityProperties(activity, entity);

        return logActivity(activity);

        function description(){
            return 'Added ' + entity.type + ' ' + entity.name;
        }
    }

    function logEntityModified(entity, appOptional){
        var app = appOptional || 'staff';
        var activity = {
            actionDescription: description(),
            app: app,
            category: modificationCategoryForApp(app)
        };

        addEntityProperties(activity, entity);

        return logActivity(activity);

        function description(){
            return 'Modified ' + entity.type + ' data ' + (entity.type === 'License' ? 'for ' + entity.name : '');
        }

        function modificationCategoryForApp(whichApp){
            return whichApp === 'vendor' ? 'vendorModified' : 'staffModified';
        }
    }

    function logOfferingModified(offering, cycle){
        var activity = {
            actionDescription: 'Modified offering data',
            app: 'staff',
            category: 'staffModified'
        };

        addEntityProperties(activity, offering);
        
        activity.cycleId = cycle.id;
        activity.cycleName = cycle.name;

        return logActivity(activity);
    }

    function logOtpPurchase(offering, appOptional){
        var app = appOptional || 'staff';
        var activity = {
            actionDescription: offering.product.name + ' selected (by ' + app + ')',
            app: app,
            category: 'selectionAdded'
        };

        addEntityProperties(activity, offering);

        activity.cycleId = cycleId(offering);
        activity.cycleName = cycleName(offering) || 'One Time Purchases';

        return logActivity(activity);
    }

    function logOtpPurchaseCancelled(offering, appOptional){
        var app = appOptional || 'staff';
        var activity = {
            actionDescription: offering.product.name + ' cancelled (by ' + app + ')',
            app: app,
            category: 'selectionRemoved'
        };

        addEntityProperties(activity, offering);

        activity.cycleId = cycleId(offering);
        activity.cycleName = cycleName(offering) || 'One Time Purchases';

        return logActivity(activity);
    }

    function logLibrarySelectedProduct(offering, cycle){
        var activity = {
            actionDescription: offering.product.name + ' selected by library',
            app: 'library',
            category: 'selectionAdded'
        };

        addEntityProperties(activity, offering);

        activity.cycleId = cycle.id;
        activity.cycleName = cycle.name;

        return logActivity(activity);
    }

    function logLibraryRemovedProduct(offering, cycle){
        var activity = {
            actionDescription: offering.product.name + ' removed by library',
            app: 'library',
            category: 'selectionRemoved'
        };

        addEntityProperties(activity, offering);

        activity.cycleId = cycle.id;
        activity.cycleName = cycle.name;

        return logActivity(activity);
    }

    function addEntityProperties(activityData, entity){
        if ( entity.type === 'Library' ){
            activityData.libraryId = entity.id;
            activityData.libraryName = entity.name;
        }
        else if ( entity.type === 'License' ){
            activityData.vendorId = entity.vendor.id;
            activityData.vendorName = entity.vendor.name;
        }
        else if ( entity.type === 'Product' ){
            activityData.cycleId = entity.cycle.id;
            activityData.cycleName = entity.cycle.name;
            activityData.productId = entity.id;
            activityData.productName = entity.name;
            activityData.vendorId = entity.vendor.id;
            activityData.vendorName = entity.vendor.name;
        }
        else if ( entity.type === 'Offering' ){
            activityData.libraryId = entity.library.id;
            activityData.libraryName = entity.library.name;
            activityData.productId = entity.product.id;
            activityData.productName = entity.product.name;
            activityData.vendorId = entity.vendorId;
            if ( typeof entity.product.vendor === 'object' ){
                activityData.vendorName = entity.product.vendor.name
            }
        }
        else if ( entity.type === 'Vendor' ){
            activityData.vendorId = entity.id;
            activityData.vendorName = entity.name;
        }
        else {
            console.log('** warning: logging activity about unknown entity type '+entity.type, entity);
        }
        activityData.affectedEntityId = entity.id || '';
        activityData.revision = entity._rev || '';
    }

    function cycleId(offering){
        if ( typeof offering.cycle === 'string' ){
            return offering.cycle;
        }
        else {
            return offering.cycle.id;
        }
    }

    function cycleName(offering){
        if ( typeof offering.cycle === 'object' ){
            return offering.cycle.name;
        }
    }
}
