angular.module('library.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q, appState, errorHandler, userService ) {

    var currentUser = userService.getUser();
    if (!currentUser.library) {
        throw new Error('Cycle Service was initialized without a valid user');
    }
    var cycleModule = CarliModules.Cycle;
    var middlewareModule = CarliModules.LibraryMiddleware;

    var currentCycle = null;

    return {
        listActiveCycles: listActiveCycles,
        listActiveCyclesIncludingOneTimePurchase: listActiveCyclesIncludingOneTimePurchase,
        listOpenForSelectionsCycles: listOpenForSelectionsCycles,
        listOpenForSelectionsAndClosedCycles: listOpenForSelectionsAndClosedCycles,
        listSelectionsForCycle: listSelectionsForCycle,
        listAllOfferingsForCycle: listAllOfferingsForCycle,
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

    function listOpenForSelectionsAndClosedCycles() {
        return listActiveCycles()
            .then(function( cycleList ){
                return cycleList.filter(cycleIsOpenToLibrariesOrClosed);
            })
            .catch(errorHandler);

        function cycleIsOpenToLibrariesOrClosed( cycle ){
            return cycle.status === 4 || cycle.status === 5;
        }
    }

    function listSelectionsForCycle( cycle ){
        return $q.when(middlewareModule.listSelectionsForLibraryFromCycle(currentUser.library.id, cycle.id))
            .catch(errorHandler);
    }

    function listAllOfferingsForCycle( cycle ){
        return $q.when(middlewareModule.listOfferingsForLibraryWithExpandedProducts(currentUser.library.id, cycle.id))
            .catch(errorHandler);
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        currentCycle = cycleObject;
    }
}
