angular.module('library.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $window, $q, errorHandler, authService, userService, persistentState ) {

    var currentUser = userService.getUser();

    if (!currentUser.library) {
        if (authService.isMasqueradingPending()) {
            tryHandleMasqueradingUser();
        } else {
            throw new Error('Cycle Service was initialized without a valid user');
        }
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
        listAllActiveOfferingsForCycle: listAllActiveOfferingsForCycle,
        listClosedAndArchivedCycles: listClosedAndArchivedCycles,
        getHistoricalSelectionDataForProductForCycle: getHistoricalSelectionDataForProductForCycle,
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ).catch(errorHandler); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle,
        CYCLE_STATUS_DATA_PROCESSING: cycleModule.CYCLE_STATUS_DATA_PROCESSING,
        CYCLE_STATUS_EDITING_PRODUCT_LIST: cycleModule.CYCLE_STATUS_EDITING_PRODUCT_LIST,
        CYCLE_STATUS_VENDOR_PRICING: cycleModule.CYCLE_STATUS_VENDOR_PRICING,
        CYCLE_STATUS_CHECKING_PRICES: cycleModule.CYCLE_STATUS_CHECKING_PRICES,
        CYCLE_STATUS_OPEN_TO_LIBRARIES: cycleModule.CYCLE_STATUS_OPEN_TO_LIBRARIES,
        CYCLE_STATUS_CLOSED: cycleModule.CYCLE_STATUS_CLOSED,
        CYCLE_STATUS_ARCHIVED: cycleModule.CYCLE_STATUS_ARCHIVED
    };

    function tryHandleMasqueradingUser() {
        authService.initializePendingMasquerading()
            .then(function () {
                $window.location.reload();
            })
            .then(authService.forceRefetchCurrentUser)
            .then(function () {
                currentUser = authService.getCurrentUser();
                if (!currentUser || !currentUser.vendor) {
                    throw new Error('Cycle Service was initialized without a valid user');
                }
            });
    }

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
            return cycle.status === cycleModule.CYCLE_STATUS_OPEN_TO_LIBRARIES;
        }
    }

    function listOpenForSelectionsAndClosedCycles() {
        return listActiveCycles()
            .then(function( cycleList ){
                return cycleList.filter(cycleIsOpenToLibrariesOrClosed);
            })
            .catch(errorHandler);

        function cycleIsOpenToLibrariesOrClosed( cycle ){
            return cycle.status === cycleModule.CYCLE_STATUS_OPEN_TO_LIBRARIES || cycle.status === cycleModule.CYCLE_STATUS_CLOSED;
        }
    }

    function listNonArchivedClosedCyclesIncludingOneTimePurchase(){
        return $q.when(cycleModule.listActiveCycles())
            .then(function( cycleList ){
                return cycleList.filter(cycleIsOneTimePurchaseOrClosed);
            })
            .catch(errorHandler);

        function cycleIsOneTimePurchaseOrClosed( cycle ){
            return cycle.cycleType === 'One-Time Purchase' || cycle.status === cycleModule.CYCLE_STATUS_CLOSED;
        }
    }

    function listClosedAndArchivedCycles(){
        return $q.when(cycleModule.list())
            .then(function(allCycles){
                return allCycles.filter(cycleIsClosedOrArchived);
            });

        function cycleIsClosedOrArchived(cycle){
            return cycle.status >= cycleModule.CYCLE_STATUS_CLOSED;
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

    function listAllActiveOfferingsForCycle( cycle ){
        return listAllOfferingsForCycle(cycle)
            .then(function(listOfOfferings){
                return listOfOfferings.filter(productIsActive);
            })
            .catch(errorHandler);

        function productIsActive(offering){
            var product = offering.product || {};
            var licenseIsActive = product.license ? product.license.isActive : true;
            var  vendorIsActive = product.vendor  ? product.vendor.isActive  : true;
            return product.isActive && licenseIsActive && vendorIsActive;
        }
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
        persistentState.setCurrentCycle(cycleObject);
    }
}
