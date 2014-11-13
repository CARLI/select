angular.module('carli.licenseService')
    .service('licenseService', licenseService);

function licenseService( CarliModules, $q ) {

    var licenseModule = CarliModules.License;

    var licenseStore = CarliModules.Store( CarliModules[CarliModules.config.store]() );

    licenseModule.setStore( licenseStore );


    /* This is fixture data. It can go away. */
    var testLicenses = [
        {"type": "License", "name": "ACME License 1", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "ACME License 2", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "ACME License 3", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "Foobar License 1", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "Foobar Publishing", "contacts": [], "websiteUrl": "http://www.foobar.com", "isActive": true, "comments": "foobar"} }

    ];
    testLicenses.forEach(function (v) {
        licenseModule.create(v);
    });
    /* ////////////// */


    return {
        list:   function() { return $q.when( licenseModule.list() ); },
        create: function() { return $q.when( licenseModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( licenseModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( licenseModule.load.apply(this, arguments) ); }
    };
}
