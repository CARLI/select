angular.module('carli.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q ) {

    var cycleModule = CarliModules.Cycle;

    var currentCycle = null;

    return {
        cycleDefaults: cycleDefaults,
        list: function() { return $q.when( cycleModule.list() ); },
        listActiveCycles: listActiveCycles,
        listActiveCyclesOfType: listActiveCyclesOfType,
        create: function(newCycle) {
            fixCycleName(newCycle);
            return $q.when(cycleModule.create(newCycle));
        },
        createCycleFrom: function( sourceCycle, newCycle ) {
            fixCycleName(newCycle);
            return $q.when(cycleModule.createCycleFrom(sourceCycle,newCycle));
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
        var deferred = $q.defer();

        cycleModule.listActiveCycles().then(function(cycleList){
            var filteredList = cycleList.filter(function(cycle){
                return cycle.cycleType !== 'One-Time Purchase';
            });

            deferred.resolve(filteredList);
        })
        .catch(function(err){
            deferred.reject(err);
        });

        return deferred.promise;
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
