#!/usr/local/bin/node

var CycleRepository = require('../CARLI').Cycle;
var cycleMigration = require('./cycle');
var libraryMigration = require('./library');
var licenseMigration = require('./license');
var migrationConfig = require('./config');
var mysql = require('mysql');
var notificationTemplates = require('./notificationTemplates');
var offeringMigration = require('./offering');
var productMigration = require('./product');
var Q = require('q');
var vendorMigration = require('./vendor');
var _ = require('lodash');

doMigration();

function doMigration(){
    var connection = initMySQLForIdal();
    var crmConnection = initMySQLForCrm();

    var vendorIdMapping = {};
    var libraryIdMapping = {};
    var crmLibraryIdMapping = {};
    var cycleIdMapping = {};
    var productIdMapping = {};

    notificationTemplates.migrateNotificationTemplates()
        .then(loadCrmLibraryMapping)
        .then(migrateLibraries)
        .then(migrateVendors)
        .then(migrateCycles)
        .then(migrateProducts)
        .then(migrateLicenses)
        .then(associateLicensesWithVendorsAndProducts)
        .then(migrateOfferings)
        .then(finishMigration)
        .then(closeIdalConnection)
        .then(closeCrmConnection)
        .done();

    function loadCrmLibraryMapping(){
        console.log("Loading CRM library mapping");

        return libraryMigration.loadCrmLibraryMapping(crmConnection);
    }

    function migrateLibraries( crmLibraryMapping ){
        crmLibraryIdMapping = crmLibraryMapping;
        console.log("Migrating libraries");

        return libraryMigration.migrateLibraries(connection, crmLibraryIdMapping);
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


        function migrateProductsForCycle(cycleId) {
            return CycleRepository.load(cycleId).then(function (cycle) {
                return productMigration.migrateProducts(connection, cycle, vendorIdMapping);
            });
        }
    }

    function migrateLicenses(productMapping){
        productIdMapping = flattenCycleMigrationResults(productMapping);
        console.log('Migrated ' + Object.keys(productIdMapping).length + ' products');

        return licenseMigration.migrateLicenses(connection);
    }

    function associateLicensesWithVendorsAndProducts(licenseMapping){
        console.log('Migrated ' + Object.keys(licenseMapping).length + ' licenses');

        return Q.all([
            licenseMigration.associateLicensesWithVendors(connection, licenseMapping, vendorIdMapping),
            licenseMigration.associateLicensesWithProducts(connection, licenseMapping, productIdMapping)
        ]);
    }



    function migrateOfferings(){
        console.log('Done associating Licenses with Vendors and Products');

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

    function closeIdalConnection() {
        console.log('Closing the IDAL database connection');
        connection.end();
    }
    function closeCrmConnection() {
        console.log('Closing the CRM database connection');
        crmConnection.end();
    }
}


function initMySQLForIdal(){
    var connection = mysql.createConnection( migrationConfig.idalDsn );
    connection.connect();
    return connection;
}

function initMySQLForCrm(){
    var connection = mysql.createConnection( migrationConfig.crmDsn );
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
