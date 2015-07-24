angular.module('common.activityLogService')
    .service('activityLogService', activityLogService);

function activityLogService( CarliModules, $q, cycleService, errorHandler, userService ) {

    var activityLogModule = CarliModules.ActivityLog;

    return {
        logActivity: logActivity,
        listActivityBetween: listActivityBetween,
        listActivitySince: listActivitySince,
        logCycleUpdate: logCycleUpdate
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


}
