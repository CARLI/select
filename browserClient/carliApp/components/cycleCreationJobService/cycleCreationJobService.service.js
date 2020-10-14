angular.module('carli.cycleCreationJobService')
    .service('cycleCreationJobService', cycleCreationJobService);

function cycleCreationJobService( CarliModules, $q, errorHandler) {
    var cycleRepositoryModule = CarliModules.CycleCreationJob;
    var cycleMiddleware = CarliModules.CycleMiddleware;


    return {
        list: function() {
            return $q.when(cycleRepositoryModule.listCycleCreationJobs()).catch(errorHandler);
        },
        resumeCycle: function( cycleID) {
            return $q.when(cycleMiddleware.resumeCycle(cycleID));
        },
    };
}
