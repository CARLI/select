var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , couchUtils = require( '../Store/CouchDb/Utils')
    , offeringRepository = require('./OfferingRepository')
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
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

function createCycleFrom( sourceCycle, newCycleData ) {
    return createCycle(newCycleData)
        .then(function(newCycleId) {
            return CycleRepository.load(newCycleId)
                .then(function (newCycle) {
                    return couchUtils.replicateFrom(sourceCycle.databaseName).to(newCycle.databaseName).thenResolve(newCycle);
                })
                .then(offeringRepository.transformOfferingsForNewCycle)
                .then(function() {
                    return newCycleId;
                });
        });
}

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
        cycle.databaseName = couchUtils.makeValidCouchDbName('cycle-' + cycle.name);

        couchUtils.createDatabase(cycle.databaseName)
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
    }
};

module.exports = {
    setStore: CycleRepository.setStore,
    create: createCycle,
    createCycleFrom: createCycleFrom,
    update: updateCycle,
    list: listCycles,
    load: loadCycle,
    statusLabels: statusLabels,
    listActiveCycles: listActiveCycles
};
