var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , CouchUtils = require( '../Store/CouchDb/Utils')
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , moment = require('moment')
    , Q = require('q')
    , _ = require('lodash')
    ;

var CycleRepository = Entity('Cycle');

CycleRepository.setStore( Store( StoreModule(StoreOptions) ) );

var statusLabels = [
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

/*
var stores = {};
function _initForCycle(cycle) {
    CycleRepository.setStore( _getStoreForCycle(cycle) );
}
function _getStoreForCycle(cycle) {
    var store = stores[cycle.id];
    if (!store) {
        var opts = _.extend({}, StoreOptions, { couchDbName: cycle.databaseName });
        stores[cycle.id] = Store( StoreModule(opts) );
    }
    return store;
}
*/

function createCycle( cycle ) {
    var deferred = Q.defer();

    var cycleDocPromise = CycleRepository.create(cycle, transformFunction);
    var databasePromise = createDatabaseForCycle(cycleDocPromise);
    Q.all([cycleDocPromise,databasePromise])
    .then(function(results) {
        deferred.resolve(results[0]);
    })
    .catch(function(err){
        deferred.reject(err);
    });

    return deferred.promise;
}

function createDatabaseForCycle( docPromise ) {
    var deferred = Q.defer();

    docPromise.then(loadCycle).then(function (cycle) {
        cycle.databaseName = CouchUtils.makeValidCouchDbName('cycle-' + cycle.name);

        CouchUtils.createDatabase(cycle.databaseName)
            .then(function commit() {
                deferred.resolve( updateCycle( cycle ) );
            })
            .catch(function rollback() {
                deferred.resolve( CycleRepository.delete( cycle.id ) );
            });
    });

    return deferred.promise;
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
                    console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(cycle);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listActiveCycles() {
    return expandCycles( CouchUtils.getCouchViewResults(config.getDbName(), 'listActiveCycles') );
}

function getStoreForCycle(cycle) {
    return Store( StoreModule(_.extend({}, StoreOptions, { couchDbName: cycle.databaseName })) );
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
    }
};

module.exports = {
    setStore: CycleRepository.setStore,
    create: createCycle,
    update: updateCycle,
    list: listCycles,
    load: loadCycle,
    statusLabels: statusLabels,
    listActiveCycles: listActiveCycles,
    getStoreForCycle: getStoreForCycle
};
