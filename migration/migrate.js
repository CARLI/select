#!/usr/local/bin/node

// dependencies
var migrationConfig = require('./config');
var mysql = require('mysql');
var vendorMigration = require('./vendor');
var migrateVendors = vendorMigration.migrateVendors;


doMigration();


function doMigration(){
    var connection = initMySQL();


    vendorIdMapping = {};

    migrateVendors(connection).then(function(vendorIds){
        vendorIdMapping = vendorIds;
        console.log('Done migrating Vendors: ',vendorIds);
    });
}


function initMySQL(){
    var connection = mysql.createConnection( migrationConfig.dsn );
    connection.connect();
    return connection;
}