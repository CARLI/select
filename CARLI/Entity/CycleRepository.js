var Entity = require('../Entity')
    , EntityTransform = require('./EntityTransformationUtils')
    , config = require('../../config')
    , couchUtils = require('../Store/CouchDb/Utils')()
    , moment = require('moment')
    , StoreOptions = config.storeOptions
    , Store = require('../Store')
    , StoreModule = require('../Store/CouchDb/Store')
    , Q = require('q')
    , _ = require('lodash')
    ;

var CycleRepository = Entity('Cycle');

CycleRepository.setStore( Store( StoreModule(StoreOptions) ) );

var statusLabels = [
    "Cycle Data Processing",
    "CARLI Editing Product List",
    "Vendor Pricing in Progress",
    "CARLI Checking Prices",
    "Libraries Selecting Products",
    "Selections Made",
    "Archived"
];
var propertiesToTransform = [];

function expandCycles(result) {
    return EntityTransform.expandListOfObjectsFromPersistence(result, propertiesToTransform, functionsToAdd);
}

function transformFunction( cycle ){
    EntityTransform.transformObjectForPersistence(cycle, propertiesToTransform);
}

function createCycleLog(msg, data) {
    var timestamp = new Date().toISOString();
    var prefix = timestamp + ' [Cycle Creation]: ';
    if (data) {
        console.log(prefix + msg, data);
    } else {
        console.log(prefix + msg);
    }
}

function createCycle( cycle, databaseType ) {
    return CycleRepository.create(cycle, transformFunction)
        .then(loadCycle)
        .then(createDatabaseForCycle);

    function createDatabaseForCycle( cycle ) {
        cycle.databaseName = couchUtils.makeValidCouchDbName('cycle-' + cycle.name);
        createCycleLog('Creating database for ' + cycle.name + ' with database ' + cycle.getDatabaseName());

        return couchUtils.createDatabase(cycle.getDatabaseName(), databaseType)
            .then(function commit() {
                createCycleLog('  Success creating database for ' + cycle.name);
                return updateCycle( cycle );
            })
            .catch(function rollback(err) {
                createCycleLog('  Failed to create database for ' + cycle.name);
                CycleRepository.delete( cycle.id );
                throw new Error('createDatabase failed: ' + err);
            });
    }
}

function updateCycle( cycle ){
    return CycleRepository.update( cycle, transformFunction );
}

function listCycles(){
    return expandCycles( CycleRepository.list() );
}

function loadCycle( cycleId ){
    var deferred = Q.defer();

    CycleRepository.load( cycleId )
        .then(function (cycle) {
            EntityTransform.expandObjectFromPersistence( cycle, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(cycle);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(cycle);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listActiveCycles() {
    return expandCycles( couchUtils.getCouchViewResultValues(config.getDbName(), 'listActiveCycles') );
}

function listPastFourCyclesMatchingCycle( cycle ){
    return listCycles()
        .then(filterPreviousCyclesMatchingType);

    function filterPreviousCyclesMatchingType( cycleList ){
        var pastCyclesOfType = cycleList.filter(function(cycleToFilter){
            return cycleToFilter.cycleType === cycle.cycleType && cycleToFilter.year < cycle.year;
        });

        if ( pastCyclesOfType.length > 4 ){
            return pastCyclesOfType.slice(0,4);
        }
        else {
            return pastCyclesOfType;
        }
    }
}

/* functions that get added as instance methods on loaded Cycles */

var functionsToAdd = {
    getStatusLabel: function () {
        return this.isArchived ? 'Archived' : statusLabels[this.status];
    },
    proceedToNextStep: function() {
        if (this.status < statusLabels.length - 1){
            ++this.status;
        }
    },
    returnToPreviousStep: function() {
        if (this.status > 0){
            --this.status;
        }
    },
    getDatabaseName: function() {
        return this.databaseName;
    },
    getCycleSelectionAndInvoiceTotals: function getCycleSelectionAndInvoiceTotals() {
        return couchUtils.getCouchViewResultValues(this.getDatabaseName(), 'getCycleSelectionAndInvoiceTotals').then(function(resultArray){
            return resultArray[0];
        });
    },
    exportForBanner: function exportForBanner() {

    },
    isOpenToLibraries: function(){
        return isOpenToLibraries(this);
    },
    isClosed: function(){
        return isClosed(this);
    },
    productsAreAvailable: function(){
        return productsAreAvailable(this);
    }
};

function setStore(store) {
    CycleRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

function isOpenToLibraries( cycle ){
    return cycle.status === statusLabels.indexOf("Libraries Selecting Products");
}

function isClosed( cycle ){
    return cycle.status === statusLabels.indexOf("Selections Made");
}

function productsAreAvailable( cycle ){
    return moment().isAfter(cycle.productsAvailableDate);
}

module.exports = {
    setStore: setStore,
    create: createCycle,
    createCycleLog: createCycleLog,
    update: updateCycle,
    list: listCycles,
    load: loadCycle,
    statusLabels: statusLabels,
    listActiveCycles: listActiveCycles,
    isOpenToLibraries: isOpenToLibraries,
    isClosed: isClosed,
    productsAreAvailable: productsAreAvailable,
    listPastFourCyclesMatchingCycle: listPastFourCyclesMatchingCycle
};
