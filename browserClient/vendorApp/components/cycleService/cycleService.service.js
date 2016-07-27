angular.module('vendor.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, config, $q, $window, appState, authService, errorHandler, persistentState ) {

    var currentUser = authService.getCurrentUser();

    if (!currentUser || !currentUser.vendor) {
        if (authService.isMasqueradingPending()) {
            tryHandleMasqueradingUser();
        } else {
            throw new Error('Cycle Service was initialized without a valid user');
        }
    }

    var cycleModule = CarliModules.Cycle(currentUser.vendor);
    var VendorDatabaseModule = CarliModules.VendorDatabaseMiddleware;

    var currentCycle = null;

    return {
        listActiveCycles: listActiveCycles,
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ).catch(errorHandler); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle,
        syncDataBackToCarli: syncDataBackToCarli,
        CYCLE_STATUS_VENDOR_PRICING: cycleModule.CYCLE_STATUS_VENDOR_PRICING
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

    function listActiveCycles() {
        return $q.when( cycleModule.listActiveCycles())
            .then(function( cycleList ){
                if ( currentUser.vendor.mayOfferOneTimePurchaseProducts ){
                    return $q.when(cycleModule.load(config.oneTimePurchaseProductsCycleDocId))
                        .then(function(otpCycle){
                            cycleList.push(otpCycle);
                            return cycleList;
                        })
                        .catch(function(err){
                            return cycleList;
                        });
                }
                else {
                    return cycleList;
                }
            })
            .catch(errorHandler);
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        appState.setCycle(cycleObject);
        persistentState.setCurrentCycle(cycleObject);
        currentCycle = cycleObject;
    }

    function syncDataBackToCarli(){
        return $q.when( VendorDatabaseModule.replicateDataFromOneVendorForCycle( currentUser.vendor.id, currentCycle.id ) );
    }
}
