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
CARLI.Cycle.setStore( store );

generateCycleFixtures().then( function(){
    Logger.log('Done creating Cycles');
});

generateLibraryFixtures().then( function( results ){
    Logger.log('Done creating Libraries');

    generateProductFixtures()
        .then( function (results){
            Logger.log('Finished generating Products');
        })
        .catch( function (err) {
            Logger.log(err);
        });
});

generateLicenseFixtures().then( function( results ){
    Logger.log('Done creating Licenses');
});

generateVendorFixtures().then( function( results ){
    Logger.log('Done creating Vendors');
});

function addIds(things) {
    things.forEach(function (thing) {
        thing.id = thing.name;
    });
}

function generateCycleFixtures() {
    var entityCreationPromises = [];
    Logger.log("Generate Cycles");

    var testCycles = [
        {"type":"Cycle", "name":"Calendar Year 2013", "cycleType":"Calendar Year", "year":2013, "status":4, "isArchived":true},
        {"type":"Cycle", "name":"Calendar Year 2014", "cycleType":"Calendar Year", "year":2014, "status":4, "isArchived":false},
        {"type":"Cycle", "name":"Calendar Year 2015", "cycleType":"Calendar Year", "year":2015, "status":2, "isArchived":false},
        {"type":"Cycle", "name":"Fiscal Year 2013", "cycleType":"Fiscal Year", "year":2013, "status":4, "isArchived":true},
        {"type":"Cycle", "name":"Fiscal Year 2014", "cycleType":"Fiscal Year", "year":2014, "status":4, "isArchived":false},
        {"type":"Cycle", "name":"Fiscal Year 2015", "cycleType":"Fiscal Year", "year":2015, "status":1, "isArchived":false},
        {"type":"Cycle", "name":"Alternative Cycle 2013", "cycleType":"Alternative Cycle", "year":2013, "status":4, "isArchived":true},
        {"type":"Cycle", "name":"Alternative Cycle 2014", "cycleType":"Alternative Cycle", "year":2014, "status":4, "isArchived":false},
        {"type":"Cycle", "name":"Alternative Cycle 2015", "cycleType":"Alternative Cycle", "year":2015, "status":3, "isArchived":false}
    ];
    testCycles.forEach(function (cycle) {
        entityCreationPromises.push( CARLI.Cycle.create(cycle) );
    });

    return Q.all( entityCreationPromises );
}

function generateLibraryFixtures() {
    var entityCreationPromises = [];
    Logger.log("Generate Libraries");

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
    Logger.log("Generate Licenses");

    var testLicenses = [
        {"type": "License", "isActive":true, "name": "ACME License 1", "contractNumber": "Contract Number 1", "vendor": "ACME Publishing"},
        {"type": "License", "isActive":true, "name": "ACME License 2", "contractNumber": "Contract Number 1", "vendor": "ACME Publishing"},
        {"type": "License", "isActive":false, "name": "ACME License 3", "contractNumber": "Contract Number 1", "vendor": "ACME Publishing"},
        {"type": "License", "isActive":true, "name": "Foobar License 1", "contractNumber": "Contract Number 1", "vendor": "ACME Publishing"}
    ];
    addIds(testLicenses);

    testLicenses.forEach(function (v) {
        entityCreationPromises.push( CARLI.License.create(v) );
    });

    return Q.all( entityCreationPromises );
}

function generateVendorFixtures() {
    var entityCreationPromises = [];
    Logger.log("Generate Vendors");

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
    Logger.log("Generate Products");

    var testProducts = [
        {"type": "Product", "isActive": true, "name": "Fiscal Year Product", "cycleType": "Fiscal Year", vendor: "ACME Publishing", license: "ACME License 1" },
        {"type": "Product", "isActive": true, "name": "Calendar Year Product", "cycleType": "Calendar Year", vendor: "ACME Publishing", license: "ACME License 2" },
        {"type": "Product", "isActive": true, "name": "Alternative Cycle Product", "cycleType": "Alternative Cycle", vendor: "ACME Publishing", license: "ACME License 3" },
        {"type": "Product", "isActive": false, "name": "Fiscal Year Product Inactive", "cycleType": "Fiscal Year", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": false, "name": "Calendar Year Product Inactive", "cycleType": "Calendar Year", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": false, "name": "Alternative Cycle Product Inactive", "cycleType": "Alternative Cycle", vendor: "ACME Publishing" },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 1", "cycleType": "One-Time Purchase", vendor: "Fonts Inc.", "oneTimePurchase": {}, license: "ACME License 1" },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 2", "cycleType": "One-Time Purchase", vendor: "Times New Roman", "oneTimePurchase": {}, license: "ACME License 1"  },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 3", "cycleType": "One-Time Purchase", vendor: "Ipsum Lorem", "oneTimePurchase": {}, license: "ACME License 1"  },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 4", "cycleType": "One-Time Purchase", vendor: "Baskerville", "oneTimePurchase": {}, license: "ACME License 1"  },
        {"type": "Product", "isActive": true, "name": "One-Time Purchase Product 5", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  },
        {"type": "Product", "isActive": false, "name": "One-Time Purchase Inactive", "cycleType": "One-Time Purchase", vendor: "ACME Publishing", "oneTimePurchase": {}  }
    ];
    addIds(testProducts);

    var listLibrariesPromise = CARLI.Library.list();

    listLibrariesPromise.then(function( libraryList ){
        var offset = 0;

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
                        price: 5000 + (++offset*100)
                    }
                }
            }

            testProductPromises.push( CARLI.Product.create(product) );
        });

        return Q.all(testProductPromises);
    })
    .catch( function(result){
        Logger.log('ListLibrary promised rejected: ',result);
    });

    return listLibrariesPromise;
}

