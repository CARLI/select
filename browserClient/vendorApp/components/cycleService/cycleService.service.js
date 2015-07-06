angular.module('vendor.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, config, $q, appState, authService, errorHandler ) {

    var currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.vendor) {
        throw new Error('Cycle Service was initialized without a valid user');
    }
    var cycleModule = CarliModules.Cycle(currentUser.vendor);
    var VendorDatabaseModule = CarliModules.VendorDatabaseMiddleware;

    var currentCycle = null;

    return {
        listActiveCycles: listActiveCycles,
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ).catch(errorHandler); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle,
        syncDataBackToCarli: syncDataBackToCarli
    };


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
        currentCycle = cycleObject;
    }

    function syncDataBackToCarli(){
        return $q.when( VendorDatabaseModule.replicateDataFromVendorsForCycle( currentCycle.id ) );
    }
}
