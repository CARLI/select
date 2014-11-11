angular.module('carli.vendorService')
    .service('vendorService', vendorService);

function vendorService( CarliModules, $q ) {

    var vendorModule = CarliModules.Vendor;

    var vendorStore = CarliModules.Store( CarliModules.MemoryStore({}) );

    vendorModule.setStore( vendorStore );


    /* This is fixture data. It can go away. */
    var testVendors = [
        {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."},
        {"type": "Vendor", "name": "Foobar Publishing", "contacts": [], "websiteUrl": "http://www.foobar.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Times New Roman", "contacts": [], "websiteUrl": "http://www.tnr.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Fonts Inc.", "contacts": [], "websiteUrl": "http://www.fontsinc.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Baskerville", "contacts": [], "websiteUrl": "http://www.baskerville.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Ipsum Lorem", "contacts": [], "websiteUrl": "http://www.ipsum.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "FOOBAR of New York", "contacts": [], "websiteUrl": "http://www.foobarny.com", "isActive": true, "comments": "acme"}
    ];
    testVendors.forEach(function (v) {
        vendorModule.create(v);
    });
    /* ////////////// */


    return {
        list:   function() { return $q.when( vendorModule.list() ); },
        create: function() { return $q.when( vendorModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( vendorModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( vendorModule.load.apply(this, arguments) ); }
    };
}
