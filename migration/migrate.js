#!/usr/local/bin/node

var CycleRepository = require('../CARLI').Cycle;
var cycleMigration = require('./cycle');
var libraryMigration = require('./library');
var migrationConfig = require('./config');
var mysql = require('mysql');
var offeringMigration = require('./offering');
var productMigration = require('./product');
var Q = require('q');
var vendorMigration = require('./vendor');
var _ = require('lodash');

doMigration();

function doMigration(){
    var connection = initMySQL();

    var vendorIdMapping = {};
    var libraryIdMapping = {};
    var cycleIdMapping = {};
    var productIdMapping = {};

    migrateLibraries()
        .then(migrateVendors)
        .then(migrateCycles)
        .then(migrateProducts)
        .then(migrateOfferings)
        .then(finishMigration)
        .then(closeConnection);


    function migrateLibraries(){
        console.log("Migrating libraries");

        return libraryMigration.migrateLibraries(connection);
    }

    function migrateVendors(libraryMapping) {
        libraryIdMapping = libraryMapping;
        console.log('Migrated ' + Object.keys(libraryMapping).length + ' libraries');

        console.log("Migrating vendors");
        return vendorMigration.migrateVendors(connection);
    }

    function migrateCycles(vendorMapping){
        vendorIdMapping = vendorMapping;
        console.log('Migrated ' + Object.keys(vendorMapping).length + ' vendors');

        console.log("Migrating cycles");
        return cycleMigration.migrateCycles(connection);
    }

    function migrateProducts(cycleMapping){
        cycleIdMapping = cycleMapping;
        console.log('Migrated ' + Object.keys(cycleMapping).length + ' cycles');

        console.log('Migrating Products *** note, these queries can take a while! ***');

        var deferred = Q.defer();
        var promises = [];

        for (var idalId in cycleIdMapping) {
            var cycleId = cycleIdMapping[idalId];
            promises.push(migrateProductsForCycle(cycleId));
        }
        Q.all(promises).then(function (results) {
            deferred.resolve(results);
        });

        return deferred.promise;
    }

    function migrateProductsForCycle(cycleId) {
        return CycleRepository.load(cycleId).then(function (cycle) {
            return productMigration.migrateProducts(connection, cycle, vendorIdMapping);
        });
    }

    function migrateOfferings(productMapping){
        productIdMapping = flattenCycleMigrationResults(productMapping);
        console.log('Migrated ' + Object.keys(productIdMapping).length + ' products');

        var deferred = Q.defer();
        var promises = [];

        for (var idalId in cycleIdMapping) {
            var cycleId = cycleIdMapping[idalId];
            promises.push(migrateOfferingsForCycle(cycleId));
        }
        Q.all(promises).then(function (results) {
            deferred.resolve(results);
        });

        return deferred.promise;
    }

    function migrateOfferingsForCycle(cycleId){
        return CycleRepository.load(cycleId).then(function (cycle) {
            return offeringMigration.migrateOfferings(connection, cycle, libraryIdMapping, productIdMapping);
        });
    }

    function finishMigration( offeringsResults ){
        //var offerings = flattenCycleMigrationResults( offeringsResults );

        console.log('Done with Migration');
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

function flattenCycleMigrationResults( arrayOfIdMappingObjects ){
    var results = {};

    for ( var i = 0 ; i < arrayOfIdMappingObjects.length; i++) {
        results = _.extend(results,arrayOfIdMappingObjects[i]);
    }

    return results;
}