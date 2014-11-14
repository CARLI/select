angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    productModule.setStore( productStore );

    return {
        list:   function() { return $q.when( productModule.list() ); },
        create: function() { return $q.when( productModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( productModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( productModule.load.apply(this, arguments) ); }
    };
}
