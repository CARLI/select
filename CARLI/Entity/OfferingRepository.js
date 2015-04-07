var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , config = require( '../../config' )
  , couchUtils = require( '../Store/CouchDb/Utils')
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

function transformOfferingsForNewCycle(newCycle, sourceCycle) {
    return listOfferings(newCycle).then(function(offerings) {
        var promises = offerings.map(transformOffering).map(saveOffering);

        return Q.all(promises);

        function transformOffering(offering) {
            return saveOfferingHistoryForYear(offering, sourceCycle.year);
        }
        function saveOffering(offering) {
            return updateOffering(offering, newCycle);
        }
    });
}

function saveOfferingHistoryForYear(offering, year) {
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

function deleteOffering( offeringId, cycle ){
    setCycle(cycle);
    return OfferingRepository.delete(offeringId);
}

function listOfferingsForLibraryId( libraryId, cycle ) {
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.databaseName, 'listOfferingsForLibraryId', libraryId.toString()), cycle )
        .then(initializeComputedValues);
}

function listOfferingsForProductId( productId, cycle ) {
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.databaseName, 'listOfferingsForProductId', productId), cycle )
        .then(initializeComputedValues);
}

function initializeComputedValues(offerings) {
    offerings.forEach(function(offering){
        offering.display = offering.display || "with-price";

        offering.flagged = getFlaggedState(offering);

        if (!offering.libraryComments) {
            offering.libraryComments = offering.product.comments;
        }
    });
    return offerings;
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    OfferingRepository.setStore(getStoreForCycle(cycle));
}


function getFlaggedState(offering){
    if ( userFlaggedState() !== undefined ){
        return userFlaggedState();
    }

    return systemFlaggedState();


    function userFlaggedState(){
        return offering.flagged;
    }

    function systemFlaggedState(){
        if ( offering.pricing && offering.pricing.su ){
            var sitePrice = offering.pricing.site || 0;

            for ( var i in offering.pricing.su ){
                if ( offering.pricing.su[i].price > sitePrice ){
                    return true;
                }
            }
        }
        return false;
    }
}

/* functions that get added as instance methods on loaded Offerings */
var functionsToAdd = {
    //warning: some Offering views are in the Middleware and cross the http layer, which strips these functions
};

function getOfferingsById( ids, cycle ){
    return expandOfferings(couchUtils.getCouchDocuments(cycle.databaseName, ids), cycle);
}

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
    delete: deleteOffering,

    listOfferingsForLibraryId: listOfferingsForLibraryId,
    listOfferingsForProductId: listOfferingsForProductId,
    getOfferingsById: getOfferingsById,
    getOfferingDisplayOptions: getOfferingDisplayOptions,
    transformOfferingsForNewCycle: transformOfferingsForNewCycle,
    saveOfferingHistoryForYear: saveOfferingHistoryForYear,

    getFlaggedState: getFlaggedState
};
