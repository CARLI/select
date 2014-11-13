angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules.MemoryStore({}) );

    productModule.setStore( productStore );


    /* This is fixture data. It can go away. */
    var testProducts = [
        {"type": "Product", isActive: true, "name": "Foobar Product" },
        {"type": "Product", isActive: true, "name": "Times New Roman" },
        {"type": "Product", isActive: true, "name": "Sticky Buddy Lint Roller" }
    ];
    testProducts.forEach(function (v) {
        productModule.create(v);
    });
    /* ////////////// */

    return {
        list:   function() { return $q.when( productModule.list() ); },
        create: function() { return $q.when( productModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( productModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( productModule.load.apply(this, arguments) ); }
    };
}