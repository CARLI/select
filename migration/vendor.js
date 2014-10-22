#!/usr/local/bin/node

// dependencies
var CONFIG = require('./config');
var mysql = require('mysql');
var Vendor = require('../CARLI/CARLI').Vendor;
var FileStore = require('../CARLI/CARLI').FileStore;
var Store = require('../CARLI/CARLI').Store;

Vendor.setStore( Store(FileStore) );

// establish the connection
var connection = mysql.createConnection( CONFIG.dsn );
connection.connect();

getVendors( function(err, rows, fields) {
    if(err) { console.log(err); }
    vendors = rows;

    connection.end();
    extractVendors(rows);
});

function getVendors(callback) {
    var query = "select * from vendor";
    connection.query(query, callback);
}


function extractVendors(vendors) {
    for (var i in vendors) {
        var vendor = extractVendor(vendors[i]);
        Vendor.create( vendor );
    }
}

function extractVendor(v) {
    return {
        name: v.name,
        previousName: "",
        websiteUrl: v.info_url,
        contacts: extractVendorContacts(v),
        comments: "",
        adminModule: v.admin_module_url || '',
        isActive: true,
        licenseAgreements: extractVendorLicenseAgreements(v),
        products: extractVendorProducts(v)
    };
}

function extractVendorContacts(vendor) {

    contactList = [];
    if (vendor.salesrep_name) {
        contactList.push(extractSalesContact(vendor, 'salesrep'));
    }
    if (vendor.salesrep2_name) {
        contactList.push(extractSalesContact(vendor, 'salesrep2'));
    }
    if (vendor.technicalcontact_name) {
        contactList.push(extractTechnicalContact(vendor, 'technicalcontact'));
    }
    if (vendor.technicalcontact2_name) {
        contactList.push(extractTechnicalContact(vendor, 'technicalcontact2'));
    }
    return contactList;
}

function extractSalesContact(vendor, prefix) {
    return {
        name: vendor[prefix + '_name'],
        email: vendor[prefix + '_email'],
        phoneNumber: vendor[prefix + '_phone'],
        contactType: "Sales"
    };
}

function extractTechnicalContact(vendor, prefix) {
    return {
        name: vendor[prefix + '_name'],
        email: vendor[prefix + '_email'],
        phoneNumber: vendor[prefix + '_phone'],
        contactType: "Technical"
    };
}

function extractVendorLicenseAgreements(vendor) {
    return [];
}

function extractVendorProducts(vendor) {
    return [];
}
