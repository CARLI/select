angular.module('library.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q, appState, errorHandler, userService ) {

    var currentUser = userService.getUser();
    if (!currentUser.library) {
        throw new Error('Cycle Service was initialized without a valid user');
    }
    var cycleModule = CarliModules.Cycle;

    var currentCycle = null;

    return {
        listActiveCycles: listActiveCycles,
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ).catch(errorHandler); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle
    };

    function listActiveCycles() {
        return $q.when( cycleModule.listActiveCycles() )
            .then(function( cycleList ){
                return cycleList.filter(cycleIsOpenToLibraries);
            })
            .catch(errorHandler);


        function cycleIsOpenToLibraries( cycle ){
            return cycle.status === 4;
        }
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        appState.setCycle(cycleObject);
        currentCycle = cycleObject;
    }
}
