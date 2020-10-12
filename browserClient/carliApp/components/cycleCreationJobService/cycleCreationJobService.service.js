angular.module('carli.cycleCreationJobService')
    .service('cycleCreationJobService', cycleCreationJobService);

function cycleCreationJobService( CarliModules, $q, errorHandler, persistentState ) {

    var cycleRepositoryModule = CarliModules.CycleCreationJob;

    var fakeProgress = {
        replication: 0,
        viewIndexing: 0,
        offeringTransformation: 0
    };

    return {
        list: function() { return $q.when( cycleRepositoryModule.list()).catch(errorHandler); }
    };
}
