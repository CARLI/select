#!/usr/local/bin/node

var Q = require('q');
var _ = require('lodash');
var mysql = require('mysql');

var carliConfig = require('../config');
carliConfig.storeOptions.couchDbUrl = carliConfig.storeOptions.privilegedCouchDbUrl;

var cycleRepository = require('../CARLI').Cycle;
var migrationConfig = require('./config');
var notificationTemplates = require('./notificationTemplates');
var vendorDatabases = require('./vendorDatabases');

var cycleMigration = require('./cycle');
var libraryMigration = require('./library');
var licenseMigration = require('./license');
var historicalPricingMigration = require('./historicalPricing');
var offeringMigration = require('./offering');
var productMigration = require('./product');
var selectionMigration = require('./selection');
var vendorMigration = require('./vendor');

//var storeOptions = config.storeOptions;
//storeOptions.couchDbUrl = storeOptions.privilegedCouchDbUrl;
//var Store = require('../CARLI/Store');
//var StoreModule = require('../CARLI/Store/CouchDb/Store');
//
//function getPrivilegedStore() {
//    return Store( StoreModule(storeOptions) );
//}
//cycleRepository.setStore( getPrivilegedStore() );

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

    createNotificationTemplates()
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
        .then(prepareForHistoricalPricingMigration)
        .then(makeVendorStatuses)
        .then(createVendorDatabases)
        .then(closeIdalConnection)
        .then(closeCrmConnection)
        .then(finishMigration)
        .done();

    function createNotificationTemplates(){
        return notificationTemplates.migrateNotificationTemplates()
            .then(function(migrateNotificationTemplatesResults){
                console.log('Added ' + migrateNotificationTemplatesResults.length + ' notification templates');
            });
    }

    function loadCrmLibraryMapping(){
        return libraryMigration.loadCrmLibraryMapping(crmConnection)
            .then(function saveCrmLibraryMapping(crmLibraryMapping){
                crmLibraryIdMapping = crmLibraryMapping;
                console.log('Loaded ' + Object.keys(crmLibraryMapping).length + ' CRM libraries');
            });
    }

    function migrateLibraries(){
        return libraryMigration.migrateLibraries(connection, crmLibraryIdMapping)
            .then(function saveLibraryIdMapping(libraryMapping){
                libraryIdMapping = libraryMapping;
                console.log('Migrated ' + Object.keys(libraryMapping).length + ' libraries');
            });
    }

    function migrateVendors(){
        return vendorMigration.migrateVendors(connection)
            .then(function saveVendorMapping(vendorMapping){
                vendorIdMapping = vendorMapping;
                console.log('Migrated ' + Object.keys(vendorMapping).length + ' vendors');
            });
    }

    function migrateLicenses(){
        return licenseMigration.migrateLicenses(connection)
            .then(function saveLicenseMapping(licenseMapping){
                licenseIdMapping = licenseMapping;
                console.log('Migrated ' + Object.keys(licenseMapping).length + ' licenses');
            })
    }

    function attachVendorsToLicenses(){
        return licenseMigration.attachVendorsToLicenses(connection, licenseIdMapping, vendorIdMapping)
            .then(function(licenseVendorAssociationsCount){
                console.log('Attached Vendors to ' + licenseVendorAssociationsCount + ' Licenses.');
            })
    }

    function generateProductLicenseAssociations(){
        return licenseMigration.generateProductLicenseAssociations(connection, licenseIdMapping)
            .then(function saveProductLicenseMap(productLicenseMap){
                productLicenseMapping = productLicenseMap;
                console.log('Generated license associations for ' + Object.keys(productLicenseMap).length + ' products');
            });
    }

    function migrateCycles(){
        return cycleMigration.migrateCycles(connection)
            .then(function saveCycleMapping(cycleMapping){
                cycleIdMapping = cycleMapping;
                console.log('Migrated ' + Object.keys(cycleMapping).length + ' cycles');
            });
    }

    function migrateProducts(){
        return productMigration.generateCouchIdsForAllIdalProducts(connection)
            .then(function(){
                var cycleCouchIds = listObjectValues(cycleIdMapping);
                return Q.all( cycleCouchIds.map(migrateProductsForCycle) );
            })
            .then(function(productMigrationResults){
                var productTotals = flattenCycleMigrationResults(productMigrationResults);
                console.log('Migrated ' + Object.keys(productTotals).length + ' products');
            });

        function migrateProductsForCycle(cycleCouchId) {
            return cycleRepository.load(cycleCouchId).then(function (cycle) {
                return productMigration.migrateProducts(connection, cycle, vendorIdMapping, productLicenseMapping).then(function(mapping) {
                    productMappingsByCycle[cycleCouchId] = mapping;
                    return mapping;
                });
            });
        }
    }

    function gatherSelections() {
        var cycleCouchIds = listObjectValues(cycleIdMapping);
        return Q.all( cycleCouchIds.map(gatherSelectionsForCycle) );

        function gatherSelectionsForCycle(cycleCouchId) {
            return cycleRepository.load(cycleCouchId).then(function (cycle) {
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
        return cycleRepository.load(cycleId).then(function (cycle) {
            return offeringMigration.migrateOfferings(connection, cycle, libraryIdMapping, productMappingsByCycle[cycleId], selectionsByCycle[cycleId]);
        });
    }

    function prepareForHistoricalPricingMigration(){
        var cycleCouchIds = listObjectValues(cycleIdMapping);
        return Q.all(cycleCouchIds.map(historicalPricingMigration.putHistoricalPricingDesignDoc));
    }

    function makeVendorStatuses(){
        return vendorDatabases.createVendorStatusesForAllCycles();
    }

    function createVendorDatabases() {
        var cycleCouchIds = listObjectValues(cycleIdMapping);
        return Q.all(cycleCouchIds.map(vendorDatabases.createAndSyncVendorDatabases));
    }

    function finishMigration(){
        console.log('Done with Migration');
        console.log('Please run `migrateHistoricalPricing.js` when everything finishes indexing.');
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
