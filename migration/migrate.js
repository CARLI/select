#!/usr/local/bin/node

var CycleRepository = require('../CARLI').Cycle;
var cycleMigration = require('./cycle');
var libraryMigration = require('./library');
var migrationConfig = require('./config');
var mysql = require('mysql');
var productMigration = require('./product');
var Q = require('q');
var vendorMigration = require('./vendor');


doMigration();

function doMigration(){
    var connection = initMySQL();

    vendorIdMapping = {};
    libraryIdMapping = {};

    migrateLibraries()
        .then(migrateVendors)
        .then(migrateCyclesAndProducts)
        .then(closeConnection);


    function migrateLibraries(){
        console.log("+++ Migrating Libraries");

        return libraryMigration.migrateLibraries(connection);
    }

    function migrateVendors(libraryMapping) {
        libraryIdMapping = libraryMapping;
        console.log('Migrated ' + Object.keys(libraryMapping).length + ' libraries');

        console.log("+++ Migrating Vendors");
        return vendorMigration.migrateVendors(connection);
    }

    function migrateCyclesAndProducts(vendorMapping) {
        vendorIdMapping = vendorMapping;
        console.log('Migrated ' + Object.keys(vendorMapping).length + ' vendors');

        console.log("+++ Migrating Cycles");
        var deferred = Q.defer();
        var promises = [];

        cycleMigration.migrateCycles().then(function (cycleIdMapping) {
            for (var idalId in cycleIdMapping) {
                var cycleId = cycleIdMapping[idalId];
                promises.push(migrateProductsForCycle(cycleId, vendorIdMapping));
            }
            Q.all(promises).then(function (results) {
                deferred.resolve(results);
            });
        });

        return deferred.promise;
    }

    function migrateProductsForCycle(cycleId, vendorIdMapping) {
        console.log("+++ Migrating Products for Cycle " + cycleId);

        return CycleRepository.load(cycleId).then(function (cycle) {
            return productMigration.migrateProducts(connection, cycle, vendorIdMapping);
        });
    }

    function closeConnection() {
        console.log('Closing the database connection');
        connection.end();
        console.log('All done!');
    }
}


function initMySQL(){
    var connection = mysql.createConnection( migrationConfig.dsn );
    connection.connect();
    return connection;
}
