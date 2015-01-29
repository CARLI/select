var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , config = require( '../../config' )
  , CycleRepository = require('./CycleRepository')
  , Validator = require('../Validator')
  , Q = require('q')
  ;

var OfferingRepository = Entity('Offering');

var propertiesToTransform = ['cycle', 'library', 'product'];

function transformFunction( offering ){
    EntityTransform.transformObjectForPersistence(offering, propertiesToTransform);
}

function createOffering( offering, cycle ){
    setCycle(cycle);
    return OfferingRepository.create( offering, transformFunction );
}

function updateOffering( offering, cycle ){
    setCycle(cycle);
    return OfferingRepository.update( offering, transformFunction );
}

function listOfferings(cycle){
    setCycle(cycle);
    return EntityTransform.expandListOfObjectsFromPersistence( OfferingRepository.list(cycle.databaseName), propertiesToTransform, functionsToAdd);
}

function loadOffering( offeringId, cycle ){
    var deferred = Q.defer();

    setCycle(cycle);
    OfferingRepository.load( offeringId )
        .then(function (offering) {
            offering.cycle = cycle;
            EntityTransform.expandObjectFromPersistence( offering, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(offering);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    console.warn('*** Cannot find reference in database to either cycle, library, or product in offering ', err);
                    deferred.resolve(offering);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}


function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    OfferingRepository.setStore(CycleRepository.getStoreForCycle(cycle));
}


/* functions that get added as instance methods on loaded Offerings */

var functionsToAdd = {};

function getOfferingDisplayOptions(){
    return Validator.getEnumValuesFor('Offering','display');
}

module.exports = {
    setStore: OfferingRepository.setStore,
    setCycle: setCycle,
    create: createOffering,
    update: updateOffering,
    list: listOfferings,
    load: loadOffering,
    getOfferingDisplayOptions: getOfferingDisplayOptions
};
