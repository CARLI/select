angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules.MemoryStore );

    productModule.setStore( productStore );


    /* This is fixture data. It can go away. */
    var testProducts = [
        {"type": "Product", "name": "Foobar Product" },
        {"type": "Product", "name": "Times New Roman" },
        {"type": "Product", "name": "Sticky Buddy Lint Roller" }
    ];
    testProducts.forEach(function (v) {
        productModule.create(v);
    });
    /* ////////////// */

    return {
        list: productModule.list,
        create: productModule.create,
        update: productModule.update,
        load: productModule.load
    };
}