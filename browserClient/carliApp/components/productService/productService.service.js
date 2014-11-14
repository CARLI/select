angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    productModule.setStore( productStore );


    return {
        list: productModule.list,
        create: productModule.create,
        update: productModule.update,
        load: productModule.load
    };
}
