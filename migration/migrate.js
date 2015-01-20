#!/usr/local/bin/node

// dependencies
var migrationConfig = require('./config');
var mysql = require('mysql');
var vendorMigration = require('./vendor');
var productMigration = require('./product');
var migrateVendors = vendorMigration.migrateVendors;
var migrateProducts = productMigration.migrateProducts;

doMigration();

function doMigration(){
    var connection = initMySQL();
    var cycle = {
        idalId: 200,
        type: 'Calendar Year',
        year: 2015
    };

    vendorIdMapping = {};

    migrateVendors(connection).then(function(vendorIds){
        vendorIdMapping = vendorIds;
        console.log('Done migrating Vendors: ',vendorIds);
        migrateProducts(connection, cycle, vendorIdMapping).then(function(productIds){
            productIdMapping = productIds;
            console.log('Done migrating Products: ',productIds);

            connection.end();
        });
    });
}


function initMySQL(){
    var connection = mysql.createConnection( migrationConfig.dsn );
    connection.connect();
    return connection;
}