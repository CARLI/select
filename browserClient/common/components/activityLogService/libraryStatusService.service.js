angular.module('common.activityLogService')
    .service('activityLogService', activityLogService);

function activityLogService( CarliModules, $q, errorHandler ) {

    var activityLogModule = CarliModules.ActivityLog;

    return {
        logActivity: logActivity,
        listActivityBetween: listActivityBetween,
        listActivitySince: listActivitySince
    };

    function logActivity(){
        return $q.when( activityLogModule.create.apply(this, arguments) )
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
}
