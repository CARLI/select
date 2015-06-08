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
var selectionMigration = require('./selection');
var Q = require('q');
var vendorMigration = require('./vendor');
var vendorDatabases = require('./vendorDatabases');
var _ = require('lodash');

doMigration();

function doMigration(){
    var connection = initMySQLForIdal();
    var crmConnection = initMySQLForCrm();

    var vendorIdMapping = {};
    var libraryIdMapping = {};
    var licenseIdMapping = {};
    var crmLibraryIdMapping = {};
    var cycleIdMapping = {};
    var productLicenseMapping = {};
    var productMappingsByCycle = {};
    var selectionsByCycle = {};

    notificationTemplates.migrateNotificationTemplates()
        .then(loadCrmLibraryMapping)
        .then(migrateLibraries)
        .then(migrateVendors)
        .then(migrateLicenses)
        .then(attachVendorsToLicenses)
        .then(generateProductLicenseAssociations)
        .then(migrateCycles)
        .then(migrateProducts)
        .then(gatherSelections)
        .then(migrateOfferings)
        .then(makeVendorStatuses)
        .then(createVendorDatabases)
        .then(finishMigration)
        .then(closeIdalConnection)
        .then(closeCrmConnection)
        .done();

    function loadCrmLibraryMapping( migrateNotificationTemplatesResults ){
        console.log('Added ' + migrateNotificationTemplatesResults.length + ' notification templates');

        return libraryMigration.loadCrmLibraryMapping(crmConnection);
    }

    function migrateLibraries( crmLibraryMapping ){
        crmLibraryIdMapping = crmLibraryMapping;
        console.log('Loaded ' + Object.keys(crmLibraryMapping).length + ' CRM libraries');

        return libraryMigration.migrateLibraries(connection, crmLibraryIdMapping);
    }

    function migrateVendors(libraryMapping) {
        libraryIdMapping = libraryMapping;
        console.log('Migrated ' + Object.keys(libraryMapping).length + ' libraries');

        return vendorMigration.migrateVendors(connection);
    }

    function migrateLicenses( vendorMapping ){
        vendorIdMapping = vendorMapping;
        console.log('Migrated ' + Object.keys(vendorMapping).length + ' vendors');

        return licenseMigration.migrateLicenses(connection);
    }

    function attachVendorsToLicenses( licenseMapping ){
        licenseIdMapping = licenseMapping;
        console.log('Migrated ' + Object.keys(licenseMapping).length + ' licenses');

        return licenseMigration.attachVendorsToLicenses(connection, licenseIdMapping, vendorIdMapping);
    }

    function generateProductLicenseAssociations( licenseVendorAssocationsCount ){
        console.log('Attached Vendors to ' + licenseVendorAssocationsCount + ' Licenses.');

        return licenseMigration.generateProductLicenseAssociations(connection, licenseIdMapping);
    }

    function migrateCycles( productLicenseMap ){
        productLicenseMapping = productLicenseMap;
        console.log('Generated license associations for ' + Object.keys(productLicenseMap).length + ' products');

        return cycleMigration.migrateCycles(connection);
    }

    function migrateProducts(cycleMapping){
        cycleIdMapping = cycleMapping;
        console.log('Migrated ' + Object.keys(cycleMapping).length + ' cycles');

        var cycleCouchIds = listObjectValues(cycleMapping);
        return Q.all( cycleCouchIds.map(migrateProductsForCycle) );


        function migrateProductsForCycle(cycleCouchId) {
            return CycleRepository.load(cycleCouchId).then(function (cycle) {
                return productMigration.migrateProducts(connection, cycle, vendorIdMapping, productLicenseMapping).then(function(mapping) {
                    productMappingsByCycle[cycleCouchId] = mapping;
                    return mapping;
                });
            });
        }
    }

    function gatherSelections(productMigrationResults) {
        var productTotals = flattenCycleMigrationResults(productMigrationResults);
        console.log('Migrated ' + Object.keys(productTotals).length + ' products');

        var cycleCouchIds = listObjectValues(cycleIdMapping);
        return Q.all( cycleCouchIds.map(gatherSelectionsForCycle) );

        function gatherSelectionsForCycle(cycleCouchId) {
            return CycleRepository.load(cycleCouchId).then(function (cycle) {
                return selectionMigration.gatherSelections(connection, cycle, productMappingsByCycle[cycleCouchId])
                    .then(function (selections) {
                        selectionsByCycle[cycleCouchId] = selections;
                    });
            });
        }
    }

    function migrateOfferings() {
        var deferred = Q.defer();
        var promises = [];

        var idalIds = Object.keys(cycleIdMapping);
        var currentIdalIndex = 0;

        function migrateOfferingsForNextCycle() {
            if (currentIdalIndex == idalIds.length) {
                return;
            }
            var cycleId = cycleIdMapping[idalIds[currentIdalIndex]];
            currentIdalIndex++;
            var offeringPromise = migrateOfferingsForCycle(cycleId);
            promises.push(offeringPromise);
            return offeringPromise.then(migrateOfferingsForNextCycle);
        }

        migrateOfferingsForNextCycle().then(function() {
            Q.all(promises).then(function (results) {
                deferred.resolve(results);
            });
        });

        return deferred.promise;
    }

    function migrateOfferingsForCycle(cycleId){
        return CycleRepository.load(cycleId).then(function (cycle) {
            return offeringMigration.migrateOfferings(connection, cycle, libraryIdMapping, productMappingsByCycle[cycleId], selectionsByCycle[cycleId]);
        });
    }

    function makeVendorStatuses(){
        return vendorDatabases.createVendorStatusesForAllCycles();
    }

    function createVendorDatabases() {
        var cycleCouchIds = listObjectValues(cycleIdMapping);

        return cycleCouchIds.map(vendorDatabases.createVendorDatabases);
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

function listObjectValues( object ){
    return Object.keys(object).map(function extractValue(key){
        return object[key];
    });
}
