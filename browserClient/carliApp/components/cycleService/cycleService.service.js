angular.module('carli.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q, errorHandler, persistentState ) {

    var cycleModule = CarliModules.Cycle;
    var cycleMiddleware = CarliModules.CycleMiddleware;
    var databaseStatusMiddleware = CarliModules.DatabaseStatusMiddleware;
    var VendorDatabaseModule = CarliModules.VendorDatabaseMiddleware;
    var libraryMiddlewareModule = CarliModules.LibraryMiddleware;

    var currentCycle = null;

    var fakeProgress = {
        replication: 0,
        viewIndexing: 0,
        offeringTransformation: 0
    };

    return {
        cycleDefaults: cycleDefaults,
        list: function() { return $q.when( cycleModule.list()).catch(errorHandler); },
        listActiveCycles: listActiveCycles,
        listActiveCyclesOfType: listActiveCyclesOfType,
        listActiveSubscriptionCycles: listActiveSubscriptionCycles,
        listNonArchivedClosedCyclesIncludingOneTimePurchase: listNonArchivedClosedCyclesIncludingOneTimePurchase,
        listSelectionsForCycle: listSelectionsForCycle,
        create: function(newCycle) {
            fixCycleName(newCycle);
            return $q.when(cycleMiddleware.create(newCycle));
        },
        createCycleFrom: function( sourceCycle, newCycle ) {
            fixCycleName(newCycle);
            return $q.when(cycleMiddleware.createCycleFrom(sourceCycle,newCycle));
        },
        getCycleCreationStatus: function(cycleId){
            return $q.when( cycleMiddleware.getCycleCreationStatus(cycleId) )
                .then(function (statusString) {
                    return statusString;
                });
        },
        getCycleDatabaseStatuses: getCycleDatabaseStatuses,
        update: function() { return $q.when( cycleModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ).catch(errorHandler); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle,
        initCurrentCycle: function(){
            listActiveCycles().then(function(cycleList){
                currentCycle = cycleList[0];
            });
        },
        syncDataToVendorDatabase: syncDataToVendorDatabase,
        syncDataToAllVendorDatabases: syncDataToAllVendorDatabases,
        syncDataToAllVendorDatabasesForCycle: syncDataToAllVendorDatabasesForCycle,
        listPastFourCyclesMatchingCycle: function( cycle ){
            return $q.when( cycleModule.listPastFourCyclesMatchingCycle(cycle || currentCycle) );
        },
        archiveCycle: archiveCycle,
        unarchiveCycle: unarchiveCycle,
        deleteCycle: deleteCycle,
        generateCycleName: generateCycleName,
        getLabelForCycleStatus: cycleModule.getStatusLabel,
        fiscalYearHasStartedForDate: cycleModule.fiscalYearHasStartedForDate,
        CYCLE_STATUS_DATA_PROCESSING: cycleModule.CYCLE_STATUS_DATA_PROCESSING,
        CYCLE_STATUS_EDITING_PRODUCT_LIST: cycleModule.CYCLE_STATUS_EDITING_PRODUCT_LIST,
        CYCLE_STATUS_VENDOR_PRICING: cycleModule.CYCLE_STATUS_VENDOR_PRICING,
        CYCLE_STATUS_CHECKING_PRICES: cycleModule.CYCLE_STATUS_CHECKING_PRICES,
        CYCLE_STATUS_OPEN_TO_LIBRARIES: cycleModule.CYCLE_STATUS_OPEN_TO_LIBRARIES,
        CYCLE_STATUS_CLOSED: cycleModule.CYCLE_STATUS_CLOSED,
        CYCLE_STATUS_ARCHIVED: cycleModule.CYCLE_STATUS_ARCHIVED
    };

    function fixCycleName(newCycle) {
        newCycle.name = generateCycleName(newCycle);
        delete newCycle.description;
    }

    function cycleDefaults() {
        return  {
            status: cycleModule.CYCLE_STATUS_DATA_PROCESSING,
            isArchived: false
        };
    }
    function generateCycleName(cycle) {
        return (cycle.cycleType == 'Alternative Cycle') ?
            cycle.description + ' ' + cycle.year :
            cycle.cycleType + ' ' + cycle.year;
    }

    function getCycleDatabaseStatuses(cycleId) {
        return $q.when( databaseStatusMiddleware.getCycleStatusForAllVendors(cycleId) );
    }

    function listActiveCycles() {
        return $q.when( cycleModule.listActiveCycles() ).catch(errorHandler);
    }

    function listActiveSubscriptionCycles() {
        return listActiveCyclesExcludingType('One-Time Purchase');
    }

    function listActiveCyclesExcludingType(type){
        function filterMatchingType(cycle) {
            return (cycle.cycleType !== type);
        }

        return listActiveCycles().then(function(activeCycleList){
            return activeCycleList.filter(filterMatchingType);
        });
    }

    function listActiveCyclesOfType(type){
        function filterMatchingType(cycle) {
            return (cycle.cycleType == type);
        }

        return listActiveCycles().then(function(activeCycleList){
            return activeCycleList.filter(filterMatchingType);
        });
    }

    function listNonArchivedClosedCyclesIncludingOneTimePurchase(){
        return listActiveCycles()
            .then(function( cycleList ){
                return cycleList.filter(cycleIsClosed);
            })
            .catch(errorHandler);

        function cycleIsClosed( cycle ){
            return cycle.status === cycleModule.CYCLE_STATUS_CLOSED;
        }
    }

    function listSelectionsForCycle( cycle, libraryId ){
        return $q.when(libraryMiddlewareModule.listSelectionsForLibraryFromCycle(libraryId, cycle.id))
            .catch(errorHandler);
    }

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        currentCycle = cycleObject;
        persistentState.setCurrentCycle(cycleObject);
    }

    function syncDataToVendorDatabase(vendorId, cycle){
        var cycleId = cycle ? cycle.id : currentCycle.id;
        return $q.when( VendorDatabaseModule.replicateDataToOneVendorForCycle(vendorId, cycleId) );
    }

    function syncDataToAllVendorDatabases(){
        return syncDataToAllVendorDatabasesForCycle();
    }

    function syncDataToAllVendorDatabasesForCycle(cycle){
        var cycleId = cycle ? cycle.id : currentCycle.id;
        return $q.when( VendorDatabaseModule.replicateDataToVendorsForCycle(cycleId) );
    }

    function archiveCycle(cycle) {
        return $q.when(cycleModule.archive(cycle));
    }

    function unarchiveCycle(cycle) {
        return $q.when(cycleModule.unarchive(cycle));
    }

    function deleteCycle(cycleObject) {
        return $q.when(cycleMiddleware.deleteCycle(cycleObject.id));
    }
}
