var config = require('../../config');
var couchUtils = require('../Store/CouchDb/Utils')();
var Entity = require('../Entity');
var EntityTransform = require('./EntityTransformationUtils');
var moment = require('moment');
var StoreOptions = config.storeOptions;
var Store = require('../Store');
var StoreModule = require('../Store/CouchDb/Store');
var vendorDatabaseName = require('./vendorDatabaseName');
var Q = require('q');
var _ = require('lodash');

var CycleRepository = Entity('Cycle');

CycleRepository.setStore( Store( StoreModule(StoreOptions) ) );

var CYCLE_STATUS_DATA_PROCESSING = 0;
var CYCLE_STATUS_EDITING_PRODUCT_LIST = 1;
var CYCLE_STATUS_VENDOR_PRICING = 2;
var CYCLE_STATUS_CHECKING_PRICES = 3;
var CYCLE_STATUS_OPEN_TO_LIBRARIES = 4;
var CYCLE_STATUS_CLOSED = 5;
var CYCLE_STATUS_ARCHIVED = 6;

var statusLabels = {};

statusLabels[CYCLE_STATUS_DATA_PROCESSING] = "Cycle Data Processing";
statusLabels[CYCLE_STATUS_EDITING_PRODUCT_LIST] = "CARLI Editing Product List";
statusLabels[CYCLE_STATUS_VENDOR_PRICING] = "Vendor Pricing in Progress";
statusLabels[CYCLE_STATUS_CHECKING_PRICES] = "CARLI Checking Prices";
statusLabels[CYCLE_STATUS_OPEN_TO_LIBRARIES] = "Libraries Selecting Products";
statusLabels[CYCLE_STATUS_CLOSED] = "Selections Made";
statusLabels[CYCLE_STATUS_ARCHIVED] = "Archived";
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
        Logger.log(prefix + msg, data);
    } else {
        Logger.log(prefix + msg);
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

function archiveCycle(cycle) {
    cycle.isArchived = true;
    cycle.status = CYCLE_STATUS_ARCHIVED;

    return CycleRepository.update( cycle, transformFunction );
}

function unarchiveCycle(cycle) {
    cycle.isArchived = false;
    cycle.status = CYCLE_STATUS_CLOSED;

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

        pastCyclesOfType.sort(function (a,b) {
            if (a.year < b.year)
                return 1;
            if (a.year > b.year)
                return -1;
            return 0;
        });

        if ( pastCyclesOfType.length > 4 )
            return pastCyclesOfType.slice(0,4);
        else
            return pastCyclesOfType;
    }
}

function getCyclesById( ids ){
    return expandCycles( couchUtils.getCouchDocuments(StoreOptions.couchDbName, ids) );
}

function getStatusLabel( status ){
    return statusLabels[status];
}

/* functions that get added as instance methods on loaded Cycles */

var functionsToAdd = {
    getStatusLabel: function () {
        return this.isArchived ? statusLabels[CYCLE_STATUS_ARCHIVED] : getStatusLabel(this.status);
    },
    proceedToNextStep: function() {
        if (this.status < CYCLE_STATUS_ARCHIVED){
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
        return couchUtils.getCouchViewResultValues(this.getDatabaseName(), 'getCycleSelectionAndInvoiceTotals')
            .then(function(resultArray){
                return resultArray[0];
            });
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
    return cycle.status === CYCLE_STATUS_OPEN_TO_LIBRARIES;
}

function isClosed( cycle ){
    return cycle.status === CYCLE_STATUS_CLOSED;
}

function productsAreAvailable( cycle ){
    return moment().isAfter(cycle.productsAvailableDate);
}

function listAllDatabaseNamesForCycle(cycle, vendors) {
    vendors = vendors || [];
    var databases = [cycle.databaseName];
    return databases.concat(vendors.map(function(vendor) {
        return vendorDatabaseName(cycle.databaseName, vendor.id);
    }));
}

function fiscalYearHasStartedForDate( dateToCheck ){
    var momentToCheck = moment(dateToCheck);

    var fiscalYearStartDate = '07-01';
    var fiscalYearStartDateForDateToCheck = momentToCheck.format('YYYY')+'-'+fiscalYearStartDate;

    return !momentToCheck.isBefore(fiscalYearStartDateForDateToCheck);
}

module.exports = {
    setStore: setStore,
    create: createCycle,
    createCycleLog: createCycleLog,
    update: updateCycle,
    archive: archiveCycle,
    unarchive: unarchiveCycle,
    delete: CycleRepository.delete,
    list: listCycles,
    load: loadCycle,
    loadNoCache: CycleRepository.loadNoCache,
    getStatusLabel: getStatusLabel,
    listActiveCycles: listActiveCycles,
    getCyclesById: getCyclesById,
    isOpenToLibraries: isOpenToLibraries,
    isClosed: isClosed,
    productsAreAvailable: productsAreAvailable,
    listPastFourCyclesMatchingCycle: listPastFourCyclesMatchingCycle,
    listAllDatabaseNamesForCycle: listAllDatabaseNamesForCycle,
    fiscalYearHasStartedForDate: fiscalYearHasStartedForDate,
    CYCLE_STATUS_DATA_PROCESSING: CYCLE_STATUS_DATA_PROCESSING,
    CYCLE_STATUS_EDITING_PRODUCT_LIST: CYCLE_STATUS_EDITING_PRODUCT_LIST,
    CYCLE_STATUS_VENDOR_PRICING: CYCLE_STATUS_VENDOR_PRICING,
    CYCLE_STATUS_CHECKING_PRICES: CYCLE_STATUS_CHECKING_PRICES,
    CYCLE_STATUS_OPEN_TO_LIBRARIES: CYCLE_STATUS_OPEN_TO_LIBRARIES,
    CYCLE_STATUS_CLOSED: CYCLE_STATUS_CLOSED,
    CYCLE_STATUS_ARCHIVED: CYCLE_STATUS_ARCHIVED
};
