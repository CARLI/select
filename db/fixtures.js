#!/usr/bin/env node

var CARLI  = require( '../CARLI'),
    dbUrl  = CARLI.config.storeOptions.couchDbUrl,
    dbName = CARLI.config.storeOptions.couchDbName,
    Q = require('q')
;

var storeOptions = {
    couchDbUrl: dbUrl,
    couchDbName: dbName
};
var store = CARLI.Store( CARLI.CouchDbStore(storeOptions) );

CARLI.Library.setStore( store ); 
CARLI.License.setStore( store );
CARLI.Vendor.setStore( store );
CARLI.Product.setStore( store );

generateLibraryFixtures().then( function( results ){
    console.log('Done creating Libraries');

    generateProductFixtures()
        .then( function (results){
            console.log('Finished generating Products');
        })
        .catch( function (err) {
            console.log(err);
        });
});

generateLicenseFixtures().then( function( results ){
    console.log('Done creating Licenses');
});

generateVendorFixtures().then( function( results ){
    console.log('Done creating Vendors');
});

function addIds(things) {
    things.forEach(function (thing) {
        thing.id = thing.name;
    });
}

function generateLibraryFixtures() {
    var entityCreationPromises = [];
    console.log("Generate Libraries");

    var testLibraries = [
        {"type":"Library", "isActive":true, "name":"Test Library", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":false, "name":"Inactive Library", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library long name", "institutionYears":"2 Year", "institutionType":"Private", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library with a much longer name than usual", "institutionYears":"4 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library 5", "institutionYears":"4 Year", "institutionType":"Private", "contacts":[]}
    ];
    addIds(testLibraries);
    testLibraries.forEach(function (l) {
        entityCreationPromises.push( CARLI.Library.create(l) );
    });

    return Q.all( entityCreationPromises );
}

function generateLicenseFixtures() {
    var entityCreationPromises = [];
    console.log("Generate Licenses");

    var testLicenses = [
        {"type": "License", "name": "ACME License 1", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "ACME License 2", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "ACME License 3", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "Foobar License 1", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "Foobar Publishing", "contacts": [], "websiteUrl": "http://www.foobar.com", "isActive": true, "comments": "foobar"} }

    ];
    addIds(testLicenses);

    testLicenses.forEach(function (v) {
        entityCreationPromises.push( CARLI.License.create(v) );
    });

    return Q.all( entityCreationPromises );
}

function generateVendorFixtures() {
    var entityCreationPromises = [];
    console.log("Generate Vendors");

    var testVendors = [
        {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."},
        {"type": "Vendor", "name": "Foobar Publishing", "contacts": [], "websiteUrl": "http://www.foobar.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Times New Roman", "contacts": [], "websiteUrl": "http://www.tnr.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Fonts Inc.", "contacts": [], "websiteUrl": "http://www.fontsinc.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Baskerville", "contacts": [], "websiteUrl": "http://www.baskerville.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "Ipsum Lorem", "contacts": [], "websiteUrl": "http://www.ipsum.com", "isActive": true, "comments": "foobar"},
        {"type": "Vendor", "name": "FOOBAR of New York", "contacts": [], "websiteUrl": "http://www.foobarny.com", "isActive": true, "comments": "acme"}
    ];
    addIds(testVendors);

    testVendors.forEach(function (v) {
        entityCreationPromises.push( CARLI.Vendor.create(v) );
    });

    return Q.all( entityCreationPromises );
}

function generateProductFixtures() {
    var testProductPromises = [];
    console.log("Generate Products");

    var testProducts = [
        {"type": "Product", "isActive": true, "name": "Fiscal Year Product", "cycleType": "Fiscal Year", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": true, "name": "Calendar Year Product", "cycleType": "Calendar Year", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": true, "name": "Alternative Cycle Product", "cycleType": "Alternative Cycle", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": false, "name": "Fiscal Year Product Inactive", "cycleType": "Fiscal Year", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": false, "name": "Calendar Year Product Inactive", "cycleType": "Calendar Year", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": false, "name": "Alternative Cycle Product Inactive", "cycleType": "Alternative Cycle", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 1", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {} },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 2", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 3", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 4", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 5", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  },
        {"type": "Product", "isActive": false, "name": "One-Time Purchase Inactive", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  }
    ];
    addIds(testProducts);

    var listLibrariesPromise = CARLI.Library.list();

    listLibrariesPromise.then(function( libraryList ){
        testProducts.forEach(function (product) {
            var i, libraryId;

            if ( product.cycleType === "One-Time Purchase" ){
                product.oneTimePurchase = {
                    annualAccessFee: 5000,
                    availableForPurchaseThrough: "2015-06-01",
                    libraryPurchaseData: {}
                };
                for ( i = 0 ; i < libraryList.length ; i++ ){
                    libraryId = libraryList[i].id;
                    product.oneTimePurchase.libraryPurchaseData[libraryId] = {
                        price: 5000
                    }
                }
            }

            testProductPromises.push( CARLI.Product.create(product) );
        });

        return Q.all(testProductPromises);
    })
    .catch( function(result){
        console.log('ListLibrary promised rejected: ',result);
    });

    return listLibrariesPromise;
}

