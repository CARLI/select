angular.module('library.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q, errorHandler, userService ) {

    var currentUser = userService.getUser();
    if (!currentUser.library) {
        throw new Error('Cycle Service was initialized without a valid user');
    }
    var cycleModule = CarliModules.Cycle;
    var middlewareModule = CarliModules.LibraryMiddleware;

    var currentCycle = null;

    return {
        list: function() { return $q.when(cycleModule.list()).catch(errorHandler); },
        listActiveCycles: listActiveCycles,
        listActiveCyclesIncludingOneTimePurchase: listActiveCyclesIncludingOneTimePurchase,
        listOpenForSelectionsCycles: listOpenForSelectionsCycles,
        listOpenForSelectionsAndClosedCycles: listOpenForSelectionsAndClosedCycles,
        listNonArchivedClosedCyclesIncludingOneTimePurchase: listNonArchivedClosedCyclesIncludingOneTimePurchase,
        listPastFourCyclesMatchingCycle: function( cycle ){
            return $q.when( cycleModule.listPastFourCyclesMatchingCycle(cycle || currentCycle) );
        },
        listSelectionsForCycle: listSelectionsForCycle,
        listAllOfferingsForCycle: listAllOfferingsForCycle,
        listClosedAndArchivedCycles: listClosedAndArchivedCycles,
        getHistoricalSelectionDataForProductForCycle: getHistoricalSelectionDataForProductForCycle,
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

    function listNonArchivedClosedCyclesIncludingOneTimePurchase(){
        return $q.when(cycleModule.listActiveCycles())
            .then(function( cycleList ){
                return cycleList.filter(cycleIsOneTimePurchaseOrClosed);
            })
            .catch(errorHandler);

        function cycleIsOneTimePurchaseOrClosed( cycle ){
            return cycle.cycleType === 'One-Time Purchase' || cycle.status === 5;
        }
    }

    function listClosedAndArchivedCycles(){
        return $q.when(cycleModule.list())
            .then(function(allCycles){
                return allCycles.filter(cycleIsClosedOrArchived);
            });

        function cycleIsClosedOrArchived(cycle){
            return cycle.status >= 5; //TODO: use constants from the cycleModule for these status numbers
        }
    }

    function listSelectionsForCycle( cycle, libraryId ){
        return $q.when(middlewareModule.listSelectionsForLibraryFromCycle(libraryId, cycle.id))
            .catch(errorHandler);
    }

    function listAllOfferingsForCycle( cycle ){
        return $q.when(middlewareModule.listOfferingsForLibraryWithExpandedProducts(currentUser.library.id, cycle.id))
            .catch(errorHandler);
    }

    function getHistoricalSelectionDataForProductForCycle( productId, cycle ) {
        return $q.when(middlewareModule.getHistoricalSelectionDataForLibraryForProduct(currentUser.library.id, productId, cycle.id))
            .catch(errorHandler);
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        currentCycle = cycleObject;
    }
}
