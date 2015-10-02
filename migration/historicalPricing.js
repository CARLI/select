var config = require('../config');
var couchApp = require('couchapp');
var couchBaseUrl = config.storeOptions.privilegedCouchDbUrl;
var CouchDbStore = require('../CARLI').CouchDbStore;
var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var cycleRepository = require('../CARLI').Cycle;
var migrationDesignDoc = require('../db/designDocs/Migration-DesignDoc.js');
var offeringRepository = require('../CARLI').Offering;
var Q = require('q');
var request = require('request');
var Store = require('../CARLI').Store;
var StoreModule = require('../CARLI/Store/CouchDb/Store');
var storeOptions = config.storeOptions;

setupPrivilegedStore();

function setupPrivilegedStore() {
    couchBaseUrl = storeOptions.privilegedCouchDbUrl;
    storeOptions.couchDbUrl = storeOptions.privilegedCouchDbUrl;

    config.setStoreOptionsForCycles( storeOptions );

    var privilegedStore = Store( StoreModule(storeOptions) );
    cycleRepository.setStore(privilegedStore);
}

function putHistoricalPricingDesignDoc( cycleId ){
    var cycle;
    var dbName;

    return cycleRepository.load(cycleId)
        .then(function(loadedCycle){
            cycle = loadedCycle;
            dbName = cycle.getDatabaseName();
            return checkIfMigrationDesignDocExists(dbName);
        })
        .then(function(designDocAlreadyExists){
            if ( designDocAlreadyExists ){
                //Logger.log('      '+cycle.name+' already has migration design doc');
                return Q();
            }
            else {
                Logger.log('      Putting design doc for migration for '+cycle.name);
                return putMigrationDesignDoc(dbName);
            }
        });
}

function populateHistoricalPricingForCycle( cycleId ){
    var cycleToCopyPricesInto;
    var offeringsToCopyPricesInto;

    if ( cycleId === config.oneTimePurchaseProductsCycleDocId ){
        return Q();
    }

    return cycleRepository.load(cycleId)
        .then(loadOfferingsForCycle)
        .then(listPastCyclesOfSameTypeAsCycle)
        .then(function(matchingCycles){
            if ( matchingCycles.length ){
                Logger.log('  Populating history from '+matchingCycles.length+' previous cycle'+(matchingCycles.length == 1 ? 's':''));
            }
            else {
                Logger.log('  No matching cycles to get history from');
            }
            return Q.all(matchingCycles.map(populatePricingFromCycle));
        })
        .then(function(){
            Logger.log('Update offerings for '+cycleToCopyPricesInto.name);
            return offeringRepository.bulkUpdateOfferings(offeringsToCopyPricesInto, cycleToCopyPricesInto);
        });

    function loadOfferingsForCycle( cycle ){
        cycleToCopyPricesInto = cycle;
        Logger.log('\nPopulate historical pricing for '+cycle.name);
        return offeringRepository.listOfferingsUnexpanded(cycleToCopyPricesInto);
    }

    function listPastCyclesOfSameTypeAsCycle( offeringsList ){
        offeringsToCopyPricesInto = offeringsList;
        Logger.log('  Find historical pricing for '+offeringsList.length+' offerings');

        var type = cycleToCopyPricesInto.cycleType;
        var year = cycleToCopyPricesInto.year;

        return cycleRepository.list()
            .then(filterCyclesPreviousMatchingType);

        function filterCyclesPreviousMatchingType( cycleList ){
            return cycleList.filter(function(cycleToFilter){
                return cycleToFilter.cycleType === type && cycleToFilter.year < year;
            });
        }
    }

    function populatePricingFromCycle( historicCycle ){
        var year = historicCycle.year;
        var dbName = historicCycle.getDatabaseName();
        var url = couchBaseUrl + '/' + dbName + '/' + '_design/Migration/_view/listOfferingsByLibraryAndProduct';

        return putHistoricalPricingDesignDoc(historicCycle.id)
            .then(function(){
                return couchUtils.couchRequest({ url: url })
                    .then(resolveWithRowValues)
                    .catch(function(error) {
                        Logger.log('error getting historical pricing from ' + historicCycle.name, error);
                    });
            })
            .then(copyHistoricalPricingFromOfferings);

        function copyHistoricalPricingFromOfferings(historicalOfferingsResults){
            var offeringsWithPricingCount = 0;
            var offeringsWithSelectionsCount = 0;

            offeringsToCopyPricesInto.forEach(copyHistoricalPricingForOffering);

            Logger.log('    found '+offeringsWithPricingCount+' offerings with pricing, and '+offeringsWithSelectionsCount+' had selections.');

            function copyHistoricalPricingForOffering(offering){
                var legacyKey = offering.library + ',' + offering.product;
                var legacyOffering =  historicalOfferingsResults[legacyKey];


                if ( legacyOffering && legacyOffering.pricing ){
                    var legacyPricing = legacyOffering.pricing || {};

                    if ( legacyPricing.site || legacyPricing.su.length ){

                        offering.history = offering.history || {};
                        offering.history[year] = {
                            pricing: legacyPricing
                        };
                        if (legacyOffering.selection ) {
                            offering.history[year].selection = legacyOffering.selection;
                            offeringsWithSelectionsCount++;
                        }

                        offeringsWithPricingCount++;
                    }
                }
            }
        }
    }
}

function putMigrationDesignDoc(dbName){
    var putDocPromise = Q.defer();
    var url = migrationDesignDocUrl(dbName);

    couchApp.createApp(migrationDesignDoc, url, function(app) {
        app.push(function() {
            putDocPromise.resolve();
        });
    });

    return putDocPromise.promise;
}

function checkIfMigrationDesignDocExists(dbName){
    var url = migrationDesignDocUrl(dbName);

    var getDocPromise = Q.defer();

    request({ url: url }, function handleCouchResponse(error, response, body) {
        var designDocExists = false;

        if ( !error && typeof body === 'string' ){
            try {
                var data = JSON.parse(body);
                if ( data._id === migrationDesignDoc._id ){
                    designDocExists = true;
                }
            }
            catch ( parseError ){
                Logger.log('Error parsing response from '+url);
            }
        }

        getDocPromise.resolve(designDocExists);
    });

    return getDocPromise.promise;
}

function migrationDesignDocUrl(dbName){
    return couchBaseUrl + '/' + dbName + '/' + migrationDesignDoc._id;
}

function resolveWithRowValues(data) {
    var resultObject = {};

    if (data.rows) {
        data.rows.forEach(function (row) {
            resultObject[row.key] = row.value;
        });
    }
    else {
        Logger.log('bad results from historic pricing view: ',data);
    }

    return resultObject;
}


module.exports = {
    populateHistoricalPricingForCycle: populateHistoricalPricingForCycle,
    putHistoricalPricingDesignDoc: putHistoricalPricingDesignDoc
};



