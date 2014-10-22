#!/usr/local/bin/node

// dependencies
var CONFIG = require('./config');
var fs = require('fs');
var mysql = require('mysql');
var mkdirp = require('mkdirp');

var vendorsDataPath = CONFIG.resourcePath + '/vendor';

// establish the connection
var connection = mysql.createConnection( CONFIG.dsn );
connection.connect();

var vendors = getVendors( function(err, rows, fields) {
    if(err) { console.log(err); }
    vendors = rows;

    connection.end();
    createJsonFiles(rows);
});


function getVendors(callback) {
    var query = "select * from vendor";
    connection.query(query, callback);
}


function createJsonFiles(vendors) {
    var vendorsListFilePath = vendorsDataPath + '/list.json';
    var vendorList = [];
    var vendorData;

    mkdirp(vendorsDataPath);

    for (var i in vendors) {
        var v = vendors[i];

        vendorList.push({id: v.id, name: v.name, isActive: true})

        createVendorJsonFile(v);
    }

    fs.writeFileSync(vendorsListFilePath, JSON.stringify(vendorList, null, 2));
}

function createVendorJsonFile(v) {
    var vendorFilePath = vendorsDataPath + '/' + v.id;
    mkdirp.sync(vendorFilePath);

    var vendorData = {
        id: v.id,
        name: v.name,
        previousName: "",
        websiteUrl: v.info_url,
        contacts: extractVendorContacts(v),
        comments: "",
        adminModule: v.admin_module_url,
        isActive: true,
        licenseAgreements: extractVendorLicenseAgreements(v),
        products: extractVendorProducts(v)
    };

    fs.writeFileSync(vendorFilePath + "/data.json", JSON.stringify(vendorData, null, 2));

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
