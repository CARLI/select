angular.module('carli.licenseService')
    .service('licenseService', licenseService);

function licenseService( CarliModules, $q ) {

    var licenseModule = CarliModules.License;

    var licenseStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    licenseModule.setStore( licenseStore );



    return {
        list:   function() { return $q.when( licenseModule.list() ); },
        create: function() { return $q.when( licenseModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( licenseModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( licenseModule.load.apply(this, arguments) ); }
    };
}
