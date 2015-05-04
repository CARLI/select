angular.module('carli.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q ) {

    var cycleModule = CarliModules.Cycle;
    var cycleMiddleware = CarliModules.CycleMiddleware;

    var currentCycle = null;

    var fakeProgress = {
        replication: 0,
        viewIndexing: 0,
        offeringTransformation: 0
    };

    return {
        cycleDefaults: cycleDefaults,
        list: function() { return $q.when( cycleModule.list() ); },
        listActiveCycles: listActiveCycles,
        listActiveCyclesOfType: listActiveCyclesOfType,
        listActiveSubscriptionCycles: listActiveSubscriptionCycles,
        create: function(newCycle) {
            fixCycleName(newCycle);
            return $q.when(cycleModule.create(newCycle));
        },
        createCycleFrom: function( sourceCycle, newCycle ) {
            fixCycleName(newCycle);
            return $q.when(cycleMiddleware.createCycleFrom(sourceCycle,newCycle));
        },
        getCycleCreationStatus: function(cycleId){
            return $q.when( cycleMiddleware.getCycleCreationStatus(cycleId) );
        },
        fakeCycleCreationStatus: function(cycleId){
            if (fakeProgress.replication < 100) {
                fakeProgress.replication += 5;
            } else if (fakeProgress.viewIndexing < 100) {
                fakeProgress.viewIndexing += 5;
            } else if (fakeProgress.offeringTransformation < 100) {
                fakeProgress.viewIndexing = 0;
                fakeProgress.offeringTransformation += 5;
            } else if (fakeProgress.viewIndexing < 100) {
                fakeProgress.viewIndexing += 5;
            }
            return $q.when( fakeProgress );
        },
        update: function() { return $q.when( cycleModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ); },
        getCurrentCycle: getCurrentCycle,
        setCurrentCycle: setCurrentCycle,
        initCurrentCycle: function(){
            listActiveCycles().then(function(cycleList){
                currentCycle = cycleList[0];
            });
        }
    };

    function fixCycleName(newCycle) {
        newCycle.name = generateCycleName(newCycle);
        delete newCycle.description;
    }

    function cycleDefaults() {
        return  {
            status: 0,
            isArchived: false
        };
    }
    function generateCycleName(cycle) {
        return (cycle.cycleType == 'Alternative Cycle') ?
            cycle.description + ' ' + cycle.year :
            cycle.cycleType + ' ' + cycle.year;
    }

    function listActiveCycles() {
        return $q.when( cycleModule.listActiveCycles() );
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

    function getCurrentCycle() {
        return currentCycle;
    }

    function setCurrentCycle(cycleObject) {
        currentCycle = cycleObject;
    }
}
