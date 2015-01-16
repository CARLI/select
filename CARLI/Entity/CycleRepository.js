var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../config' )
    , CouchUtils = require( '../Store/CouchDb/Utils')
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , moment = require('moment')
    , Q = require('q')
    , _ = require('underscore')
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
    var cycleDocPromise = CycleRepository.create(cycle, transformFunction);
    createDatabase(cycle, cycleDocPromise);
    return cycleDocPromise;
}

function createDatabase( cycle, docPromise ) {
    docPromise.then(function(cycleId) {
        cycle.id = cycleId;
        cycle.databaseName = CouchUtils.makeValidCouchDbName(cycle.name);

        CouchUtils.createDatabase('cycle-' + cycle.databaseName)
            .then(function commit() {
                updateCycle( cycle );
            })
            .catch(function rollback() {
                CycleRepository.delete( cycle.id );
            });
    });
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
    return expandCycles( CouchUtils.getCouchViewResults('listActiveCycles') );
}

/* functions that get added as instance methods on loaded Cycles */

var functionsToAdd = {
    getStatusLabel: function () {
        return this.isArchived ? 'Archived' : statusLabels[this.status];
    }
};

module.exports = {
    setStore: CycleRepository.setStore,
    create: createCycle,
    update: updateCycle,
    list: listCycles,
    load: loadCycle,
    statusLabels: statusLabels,
    listActiveCycles: listActiveCycles
};
