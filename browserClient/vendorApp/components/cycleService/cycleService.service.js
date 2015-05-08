angular.module('vendor.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, config, $q, appState, userService ) {

    var currentUser = userService.getUser();
    if (!currentUser.vendor) {
        throw new Error('Cycle Service was initialized without a valid user');
    }
    var cycleModule = CarliModules.Cycle(currentUser.vendor);

    var currentCycle = null;

    return {
        listActiveCycles: listActiveCycles,
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle
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
            });
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        appState.setCycle(cycleObject);
        currentCycle = cycleObject;
    }
}
