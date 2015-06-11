angular.module('library.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q, appState, errorHandler, userService ) {

    var currentUser = userService.getUser();
    if (!currentUser.library) {
        throw new Error('Cycle Service was initialized without a valid user');
    }
    var cycleModule = CarliModules.Cycle;
    var offeringModule = CarliModules.Offering;

    var currentCycle = null;

    return {
        listActiveCycles: listActiveCycles,
        listActiveCyclesIncludingOneTimePurchase: listActiveCyclesIncludingOneTimePurchase,
        listOpenForSelectionsCycles: listOpenForSelectionsCycles,
        listSelectionsForCycle: listSelectionsForCycle,
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ).catch(errorHandler); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle
    };

    function listActiveCycles(){
        return $q.when( cycleModule.listActiveCycles() )
            .then(function( cycleList ){
                return cycleList.filter(excludeOneTimePurchaseCycle);
            })
            .catch(errorHandler);

        function excludeOneTimePurchaseCycle( cycle ){
            return cycle.cycleType !== 'One-Time Purchase';
        }
    }

    function listActiveCyclesIncludingOneTimePurchase(){
        return $q.when( cycleModule.listActiveCycles() );
    }

    function listOpenForSelectionsCycles() {
        return listActiveCycles()
            .then(function( cycleList ){
                return cycleList.filter(cycleIsOpenToLibraries);
            })
            .catch(errorHandler);

        function cycleIsOpenToLibraries( cycle ){
            return cycle.status === 4;
        }
    }

    function listSelectionsForCycle( cycle ){
        return $q.when(offeringModule.listOfferingsWithSelectionsForLibrary(currentUser.library.id.toString(),cycle))
            .catch(errorHandler);
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        appState.setCycle(cycleObject);
        currentCycle = cycleObject;
    }
}
