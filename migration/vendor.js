#!/usr/local/bin/node

// dependencies
var CONFIG = require('./config');
var fs = require('fs');
var mysql = require('mysql');
var mkdirp = require('mkdirp');

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

    var vendorsFilePath = 'data/vendor/list.json';
    var vendorList = [];
    var vendorData;

    mkdirp('data/vendor');

    for (var i in vendors) {
        var v = vendors[i];

        vendorList.push({id: v.id, name: v.name, isActive: true})

        createVendorJsonFile(v);
    }

    fs.writeFileSync(vendorsFilePath, JSON.stringify(vendorList, null, 2));
}

function createVendorJsonFile(v) {
    vendorFilePath = 'data/vendor/' + v.id;
    mkdirp(vendorFilePath);

    vendorData = {
        id: v.id,
        name: v.name,
        previousName: "",
        webSite: v.info_url,
        contacts: extractVendorContacts(v),
        comments: "",
        adminModule: v.admin_module_url,
        isActive: true,
        licenseAgreements: extractVendorLicenseAgreements(v),
        products: extractVendorProducts(v)
    }

    fs.writeFileSync(vendorFilePath + "/data.json", JSON.stringify(vendorData, null, 2));

}

function extractVendorContacts(vendor) {

    contactList = [];
    if (vendor.salesrep_name) {
        contactList.push(extractSalesContact(vendor));
    }
    if (vendor.salesrep2_name) {
        contactList.push(extractSalesContact2(vendor));
    }
    if (vendor.technicalcontact_name) {
        contactList.push(extractTechnicalContact(vendor));
    }
    if (vendor.technicalcontact2_name) {
        contactList.push(extractTechnicalContact2(vendor));
    }
    return contactList;
}

function extractSalesContact(vendor) {
    return {
        firstName: vendor.salesrep_name,
        lastName: "",
        email: vendor.salesrep_email,
        phoneNumber: vendor.salesrep_phone,
        contactType: "Sales"
    };
}

function extractSalesContact2(vendor) {
    return {
        firstName: vendor.salesrep2_name,
        lastName: "",
        email: vendor.salesrep2_email,
        phoneNumber: vendor.salesrep2_phone,
        contactType: "Sales"
    };
}

function extractTechnicalContact(vendor) {
    return {
        firstName: vendor.technicalcontact_name,
        lastName: "",
        email: vendor.technicalcontact_email,
        phoneNumber: vendor.technicalcontact_phone,
        contactType: "Technical"
    };
}

function extractTechnicalContact2(vendor) {
    return {
        firstName: vendor.technicalcontact2_name,
        lastName: "",
        email: vendor.technicalcontact2_email,
        phoneNumber: vendor.technicalcontact2_phone,
        contactType: "Technical"
    };
}

function extractVendorLicenseAgreements(vendor) {
    return [];
}

function extractVendorProducts(vendor) {
    return [];
}
