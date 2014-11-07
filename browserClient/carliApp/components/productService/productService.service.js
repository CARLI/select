angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules.MemoryStore );

    productModule.setStore( productStore );


    /* This is fixture data. It can go away. */
    var testProducts = [
        {"type": "Product", "name": "Foobar Product", "contacts": [], "websiteUrl": "http://www.foobar.com", "isActive": true, "comments": "foobar"},
        {"type": "Product", "name": "Times New Roman", "contacts": [], "websiteUrl": "http://www.tnr.com", "isActive": true, "comments": "foobar"},
        {"type": "Product", "name": "Fonts Inc.", "contacts": [], "websiteUrl": "http://www.fontsinc.com", "isActive": true, "comments": "foobar"},
        {"type": "Product", "name": "Baskerville", "contacts": [], "websiteUrl": "http://www.baskerville.com", "isActive": true, "comments": "foobar"},
        {"type": "Product", "name": "Ipsum Lorem", "contacts": [], "websiteUrl": "http://www.ipsum.com", "isActive": true, "comments": "foobar"},
        {"type": "Product", "name": "FOOBAR of New York", "contacts": [], "websiteUrl": "http://www.foobarny.com", "isActive": true, "comments": "acme"}
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