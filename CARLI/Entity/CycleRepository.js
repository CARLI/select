var Entity = require('../Entity')
    , EntityTransform = require('./EntityTransformationUtils')
    , config = require('../../config')
    , couchUtils = require('../Store/CouchDb/Utils')
    , cycleCreation = require('../../config/environmentDependentModules/cycleCreation')
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
    "Vendors Setting Prices",
    "CARLI Checking Prices",
    "Libraries Selecting Products",
    "Products Available",
    "Archived"
];
var propertiesToTransform = [];

function expandCycles(result) {
    return EntityTransform.expandListOfObjectsFromPersistence(result, propertiesToTransform, functionsToAdd);
}

function transformFunction( cycle ){
    EntityTransform.transformObjectForPersistence(cycle, propertiesToTransform);
}

function createCycleFrom( sourceCycle, newCycleData ) {
    return cycleCreation.createCycleFrom(sourceCycle, newCycleData);
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

function createCycle( cycle ) {

    return CycleRepository.create(cycle, transformFunction)
        .then(loadCycle)
        .then(createDatabaseForCycle)
        .then(loadCycle)
        .then(triggerViewIndexing)
        .then(resolveCycleId);

    function createDatabaseForCycle( cycle ) {
        cycle.databaseName = couchUtils.makeValidCouchDbName('cycle-' + cycle.name);
        createCycleLog('Creating database for ' + cycle.name + ' with database ' + cycle.databaseName);

        return couchUtils.createDatabase(cycle.databaseName)
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

    function triggerViewIndexing(cycle) {
        createCycleLog('Triggering view indexing for ' + cycle.name + ' with database ' + cycle.databaseName);
        couchUtils.triggerViewIndexing(cycle.databaseName);
        return cycle;
    }

    function resolveCycleId(cycle){
        return cycle.id;
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
    getCycleSelectionAndInvoiceTotals: function getCycleSelectionAndInvoiceTotals() {
        return couchUtils.getCouchViewResultValues(this.databaseName, 'getCycleSelectionAndInvoiceTotals').then(function(resultArray){
            return resultArray[0];
        });
    },
    getViewUpdateProgress: function getViewUpdateStatus(){
        var database = this.databaseName;

        return couchUtils.getRunningCouchJobs().then(filterIndexJobs).then(filterByCycle).then(resolveToProgress);

        function filterIndexJobs( jobs ){
            return jobs.filter(function(job){
                return job.type === 'indexer';
            });
        }

        function filterByCycle( jobs ){
            return jobs.filter(function(job){
                return job.database === database;
            });
        }

        function resolveToProgress( jobs ){
            return jobs.length ? jobs[0].progress : 100;
        }
    }
};

module.exports = {
    setStore: CycleRepository.setStore,
    create: createCycle,
    createCycleFrom: createCycleFrom,
    createCycleLog: createCycleLog,
    update: updateCycle,
    list: listCycles,
    load: loadCycle,
    statusLabels: statusLabels,
    listActiveCycles: listActiveCycles
};
