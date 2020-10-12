angular.module('carli.cycleCreationJobService')
    .service('cycleCreationJobService', cycleCreationJobService);

function cycleCreationJobService( CarliModules, $q, errorHandler) {
    var cycleRepositoryModule = CarliModules.CycleCreationJob;

    return {
        list: function() { return $q.when( cycleRepositoryModule.list()).catch(errorHandler); }
    };
}
