var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , config = require( '../../config' )
  , CouchUtils = require( '../Store/CouchDb/Utils')
  , getStoreForCycle = require('./getStoreForCycle')
  , Validator = require('../Validator')
  , Q = require('q')
  , _ = require('lodash')
  ;

var OfferingRepository = Entity('Offering');

var propertiesToTransform = ['library', 'product'];

function transformFunction( offering ){
    EntityTransform.transformObjectForPersistence(offering, propertiesToTransform);
}

function expandOfferings( offeringsListPromise, cycle ){
    var attachCyclesPromise = offeringsListPromise.then(function(offerings) {
        offerings.forEach(function (offering) {
            offering.cycle = cycle;
        });
        return offerings;
    });
    return EntityTransform.expandListOfObjectsFromPersistence( attachCyclesPromise, propertiesToTransform, functionsToAdd);
}

function transformCycleReference( offering, cycle ) {
    if (offering) {
        offering.cycle = cycle.id; //manually transform cycle property from object to reference
    }
}

function createOffering( offering, cycle ){
    setCycle(cycle);
    transformCycleReference(offering, cycle);
    return OfferingRepository.create( offering, transformFunction );
}

function updateOffering( offering, cycle ){
    setCycle(cycle);
    transformCycleReference(offering, cycle);
    return OfferingRepository.update( offering, transformFunction );
}

function listOfferings(cycle){
    setCycle(cycle);
    return expandOfferings( OfferingRepository.list(cycle.databaseName), cycle);
}

function transformOfferingsForNewCycle(cycle) {
    listOfferings().then(function(offerings) {
        offerings.forEach(transformOfferingForNewCycle);
    });
}

function transformOfferingForNewCycle(offering) {
    var year = offering.cycle.year;
    offering.history = offering.history || {};
    offering.history[year] = {
        pricing: _.clone(offering.pricing)
    };
    if (offering.selection ) {
        offering.history[year].selection = _.clone(offering.selection);
    }
    return offering;
}

function loadOffering( offeringId, cycle ){
    var deferred = Q.defer();

    setCycle(cycle);
    OfferingRepository.load( offeringId )
        .then(function (offering) {
            offering.cycle = cycle; //Manually transform cycle reference to object
            EntityTransform.expandObjectFromPersistence( offering, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(offering);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database to either cycle, library, or product in offering ', err);
                    deferred.resolve(offering);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listOfferingsForLibraryId( libraryId, cycle ) {
    setCycle(cycle);
    return expandOfferings( CouchUtils.getCouchViewResultValues(cycle.databaseName, 'listOfferingsForLibraryId', libraryId.toString()), cycle );
}

function listOfferingsForProductId( productId, cycle ) {
    setCycle(cycle);
    return expandOfferings( CouchUtils.getCouchViewResultValues(cycle.databaseName, 'listOfferingsForProductId', productId), cycle );
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    OfferingRepository.setStore(getStoreForCycle(cycle));
}


/* functions that get added as instance methods on loaded Offerings */
var getFlaggedState = function(){
    if ( this.flagged === true || this.flagged === false ){
        return this.flagged;
    }

    if ( this.pricing && this.pricing.su ){
        var sitePrice = this.pricing.site || 0;

        for ( var i in this.pricing.su ){
            if ( this.pricing.su[i].price > sitePrice ){
                return true;
            }
        }
    }

    return false;
};

var functionsToAdd = {
    getFlaggedState: getFlaggedState
};

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

    listOfferingsForLibraryId: listOfferingsForLibraryId,
    listOfferingsForProductId: listOfferingsForProductId,
    getOfferingDisplayOptions: getOfferingDisplayOptions,
    transformOfferingsForNewCycle: transformOfferingsForNewCycle,
    transformOfferingForNewCycle: transformOfferingForNewCycle
};
