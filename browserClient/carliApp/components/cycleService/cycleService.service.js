angular.module('carli.cycleService')
    .service('cycleService', cycleService);

function cycleService( CarliModules, $q ) {

    var cycleModule = CarliModules.Cycle;

    var cycleStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    cycleModule.setStore( cycleStore );

    return {
        list:   function() { return $q.when( cycleModule.list() ); },
        create: function() { return $q.when( cycleModule.create.apply( this, arguments) ); },
        update: function() { return $q.when( cycleModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( cycleModule.load.apply( this, arguments) ); }
    };
}
