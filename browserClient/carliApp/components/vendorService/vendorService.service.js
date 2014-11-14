angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService( CarliModules, $q ) {

    var vendorModule = CarliModules.Vendor;

    var vendorStore = CarliModules.Store( CarliModules[CarliModules.config.store]() );

    vendorModule.setStore( vendorStore );

    return {
        list:   function() { return $q.when( vendorModule.list() ); },
        create: function() { return $q.when( vendorModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( vendorModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( vendorModule.load.apply(this, arguments) ); }
    };
}
