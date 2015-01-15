#!/usr/local/bin/node

// dependencies
var migrationConfig = require('./config');
var mysql = require('mysql');
var vendorMigration = require('./vendor');
var migrateVendors = vendorMigration.migrateVendors;



doMigration();


function doMigration(){
    var connection = initMySQL();
    connection.connect();

    vendorIdMapping = {};

    migrateVendors(connection).then(function(vendorIds){
        vendorIdMapping = vendorIds;
        console.log('Done migrating Vendors: ',vendorIds);
    });
}




function initMySQL(){
    return connection = mysql.createConnection( migrationConfig.dsn );
}