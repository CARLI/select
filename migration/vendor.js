#!/usr/local/bin/node

// dependencies
var CONFIG = require('./config');
var fs = require('fs');
var mysql = require('mysql');

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
    fs.mkdirSync('data/vendor');

    for (var i in vendors) {
        // TODO: write out each vendor in an individual file in this loop
        vendorList.push( { id: vendors[i].id, name: vendors[i].name, isActive: true})

    }

    fs.writeFileSync( vendorsFilePath, JSON.stringify(vendorList, null, 2));

}