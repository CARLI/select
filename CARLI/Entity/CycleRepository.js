var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../config' )
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDbStore')
    , moment = require('moment')
    , Q = require('q')
    ;

var CycleRepository = Entity('Cycle');
CycleRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = [];

function transformFunction( cycle ){
    EntityTransform.transformObjectForPersistence(cycle, propertiesToTransform);
}

function createCycle( cycle ){
    return CycleRepository.create( cycle, transformFunction );
}

function updateCycle( cycle ){
    return CycleRepository.update( cycle, transformFunction );
}

function listCycles(){
    return EntityTransform.expandListOfObjectsFromPersistence( CycleRepository.list(), propertiesToTransform, functionsToAdd);
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


/* functions that get added as instance methods on loaded Cycles */

var functionsToAdd = {
};

module.exports = {
    setStore: CycleRepository.setStore,
    create: createCycle,
    update: updateCycle,
    list: listCycles,
    load: loadCycle
};
