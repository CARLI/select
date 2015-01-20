angular.module('carli.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q ) {

    var cycleModule = CarliModules.Cycle;

    return {
        cycleDefaults: cycleDefaults,
        list: function() { return $q.when( cycleModule.list() ); },
        listActiveCycles:  function() { return $q.when( cycleModule.listActiveCycles() ); },
        create: function(newCycle) {
            newCycle.name = generateCycleName(newCycle);
            delete newCycle.description;
            return $q.when(cycleModule.create(newCycle));
        },
        update: function() { return $q.when( cycleModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ); }
    };

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
}
