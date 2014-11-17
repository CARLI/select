#!/usr/bin/env node

var CARLI  = require( '../CARLI'),
    dbUrl  = CARLI.config.storeOptions.couchDbUrl,
    dbName = CARLI.config.storeOptions.couchDbName
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

generateLibraryFixtures();
generateLicenseFixtures();
generateVendorFixtures();
generateProductFixtures();

function generateLibraryFixtures() {
    var testLibraries = [
        {"type":"Library", "isActive":true, "name":"Test Library", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":false, "name":"Inactive Library", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library long name", "institutionYears":"2 Year", "institutionType":"Private", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library with a much longer name than usual", "institutionYears":"4 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library 5", "institutionYears":"4 Year", "institutionType":"Private", "contacts":[]}
    ];
    function createTestLibraries() {
        testLibraries.forEach(function (l) {
            CARLI.Library.create(l);
        });
    }
    createTestLibraries();
}

function generateLicenseFixtures() {
    var testLicenses = [
        {"type": "License", "name": "ACME License 1", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "ACME License 2", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "ACME License 3", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "ACME Publishing", "contacts": [{"contactType":"Billing","name":"Name","email":"Email","phoneNumber":"Phone"},{"contactType":"Billing","name":"Name2","email":"Email2","phoneNumber":"Phone2"},{"contactType":"Sales","name":"Name","email":"Email","phoneNumber":"Phone"}], "websiteUrl": "http://www.acme.com", "isActive": true, "comments": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus enim est, rhoncus ut ligula a, rhoncus maximus urna. Sed orci augue, cursus eget quam et, dignissim rhoncus enim. Nulla nec gravida dui. Nam at ligula quis nisi condimentum interdum id ac dolor.",adminModule:"Morbi pharetra nisl sed faucibus dictum. Vivamus laoreet orci ex, eget feugiat enim consequat quis. Vestibulum ac ornare nisi. Aliquam eros lacus, sodales vitae iaculis et, finibus eget dui. Mauris et convallis ligula."} },
        {"type": "License", "name": "Foobar License 1", "contractNumber": "Contract Number 1", "vendor": {"type": "Vendor", "name": "Foobar Publishing", "contacts": [], "websiteUrl": "http://www.foobar.com", "isActive": true, "comments": "foobar"} }

    ];
    testLicenses.forEach(function (v) {
        CARLI.License.create(v);
    });
}

function generateVendorFixtures() {
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
        CARLI.Vendor.create(v);
    });
}

function generateProductFixtures() {
    var testProducts = [
        {"type": "Product", "name": "Foobar Product" },
        {"type": "Product", "name": "Times New Roman" },
        {"type": "Product", "name": "Sticky Buddy Lint Roller" }
    ];
    testProducts.forEach(function (v) {
        CARLI.Product.create(v);
    });

}
