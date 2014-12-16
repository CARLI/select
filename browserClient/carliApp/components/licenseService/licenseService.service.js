angular.module('carli.licenseService')
    .service('licenseService', licenseService);

function licenseService( CarliModules, $q, entityBaseService, vendorService ) {

    var licenseModule = CarliModules.License;

    return {
        list:   function() { return $q.when( licenseModule.list() ); },
        create: function() { return $q.when( licenseModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( licenseModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( licenseModule.load.apply(this, arguments) ); },
    };
}
