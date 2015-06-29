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
                //console.log('      '+cycle.name+' already has migration design doc');
                return Q();
            }
            else {
                console.log('      Putting design doc for migration for '+cycle.name);
                return putMigrationDesignDoc(dbName);
            }
        });
}

function populateHistoricalPricingForCycle( cycleId ){
    var cycleToCopyPricesInto;
    var offeringsToCopyPricesInto;

    return cycleRepository.load(cycleId)
        .then(loadOfferingsForCycle)
        .then(listPastCyclesOfSameTypeAsCycle)
        .then(function(matchingCycles){
            console.log('  Populating history from '+matchingCycles.length+' previous cycle'+(matchingCycles.length > 1 ? 's':''));
            return Q.all(matchingCycles.map(populatePricingFromCycle));
        });

    function loadOfferingsForCycle( cycle ){
        cycleToCopyPricesInto = cycle;
        console.log('Populate historical pricing for '+cycle.name);
        return offeringRepository.listOfferingsUnexpanded(cycleToCopyPricesInto);
    }

    function listPastCyclesOfSameTypeAsCycle( offeringsList ){
        offeringsToCopyPricesInto = offeringsList;
        console.log('  Find historical pricing for '+offeringsList.length+' offerings');

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
        var dbName = historicCycle.getDatabaseName();
        var url = couchBaseUrl + '/' + dbName + '/' + '_design/Migration/_view/listOfferingsByLibraryAndProduct';

        return putHistoricalPricingDesignDoc(historicCycle.id) //TODO: put migration design doc in main cycle migration
            .then(function(){
                return couchUtils.couchRequest({ url: url })
                    .then(resolveWithRowValues)
                    .catch(function(error) {
                        console.log('error getting historical pricing from ' + historicCycle.name, error);
                    });
            })
            .then(function(historicalOfferingsResults){
                console.log('    got '+Object.keys(historicalOfferingsResults).length+' historical offerings for '+historicCycle.name);
            });


        function resolveWithRowValues(data) {
            var resultObject = {};

            if (data.rows) {
                data.rows.forEach(function (row) {
                    resultObject[row.key] = row.value;
                });
            }
            else {
                console.log('bad results from historic pricing view: ',data);
            }

            return resultObject;
        }

    }
}

function putMigrationDesignDoc(dbName){
    var putDocPromise = Q.defer();

    var url = migrationDesignDocUrl(dbName);

    console.log('Put migration design doc: '+url);

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
                console.log('Error parsing response from '+url);
            }
        }

        getDocPromise.resolve(designDocExists);
    });

    return getDocPromise.promise;
}

function migrationDesignDocUrl(dbName){
    return couchBaseUrl + '/' + dbName + '/' + migrationDesignDoc._id;
}


module.exports = {
    populateHistoricalPricingForCycle: populateHistoricalPricingForCycle,
    putHistoricalPricingDesignDoc: putHistoricalPricingDesignDoc
};



