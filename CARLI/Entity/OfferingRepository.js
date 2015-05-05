var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , config = require( '../../config' )
  , couchUtils = require( '../Store/CouchDb/Utils')
  , cycleRepository = require('./CycleRepository')
  , getStoreForCycle = require('./getStoreForCycle')
  , Validator = require('../Validator')
  , productRepository = require('./ProductRepository')
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
function findVendorIdForOffering(offering, cycle) {
    if ( !offering ){
        throw new Error('Data Required');
    }
    if (offering.vendorId) {
        return Q(offering.vendorId);
    }
    if (typeof offering.product == 'object') {
        if (typeof offering.product.vendor == 'object') {
            offering.vendorId = offering.product.vendor.id;
        } else {
            offering.vendorId = offering.product.vendor;
        }
        return Q(offering.vendorId);
    }
    if ( offering.product ){
        return productRepository.load(offering.product, cycle)
            .then(function (product) {
                offering.vendorId = product.vendor.id;
                return offering.vendorId;
            })
            .catch(function(product){
                return '';
            });
    }
    return Q('');
}

function createOffering( offering, cycle ){
    setCycle(cycle);
    transformCycleReference(offering, cycle);

    return findVendorIdForOffering( offering, cycle)
        .then(function(vendorId){
            return OfferingRepository.create( offering, transformOffering );

            function transformOffering( offering ){
                offering.vendorId = vendorId;
                transformFunction(offering);
            }
        });
}

function updateOffering( offering, cycle ){
    setCycle(cycle);
    transformCycleReference(offering, cycle);
    return OfferingRepository.update( offering, transformFunction );
}

function listOfferings(cycle){
    setCycle(cycle);
    return expandOfferings( OfferingRepository.list(cycle.getDatabaseName()), cycle);
}

function transformOfferingsForNewCycle(newCycle, sourceCycle) {
    return listUnexpandedOfferings(newCycle).then(function(offerings) {
        console.log('[Cycle Creation]: Transforming ' + offerings.length + ' offerings');
        return transformOfferingsInBatches(offerings, 1 /* Math.floor( offerings.length / 100 ) */)
            .then(setProgressComplete);
    });

    function setProgressComplete(){
        return cycleRepository.load(newCycle.id)
            .then(function(cycle){
                cycle.offeringTransformationPercentComplete = 100;
                return cycle;
            })
            .then(cycleRepository.update);
    }

    function listUnexpandedOfferings(cycle) {
        setCycle(cycle);
        return OfferingRepository.list(cycle.getDatabaseName());
    }
    function updateUnexpandedOffering(offering, cycle) {
        setCycle(cycle);
        return OfferingRepository.update( offering, function() {} );
    }

    function transformOfferingsInBatches(offerings, numBatches) {
        var offeringsPartitions = partitionOfferingsList(offerings, numBatches);
        var currentBatch = 0;

        return updateNextBatch();

        function updateNextBatch(results) {
            if (currentBatch == numBatches) {
                return results;
            }
            // console.log('[Cycle Creation]: Transforming offerings ' + (currentBatch + 1) + '/' + numBatches);
            return transformOfferingsBatch(offeringsPartitions[currentBatch])
                .then(incrementBatch)
                .then(updateProgress)
                .then(updateNextBatch);
        }

        function transformOfferingsBatch(offeringsBatch) {
            offeringsBatch.forEach(function (offering) {
                copyOfferingHistoryForYear(offering, sourceCycle.year);
            });
            var updatePromises = [];
            return couchUtils.bulkUpdateDocuments(newCycle.getDatabaseName(), offeringsBatch);
            //offeringsBatch.forEach(function (offering) {
            //    updatePromises.push(updateUnexpandedOffering(offering, newCycle));
            //});
            //return Q.all( updatePromises );
        }

        function incrementBatch(results) {
            currentBatch++;
            return results;
        }

        function updateProgress(){
            return cycleRepository.load(newCycle.id)
                .then(function(cycle){
                    cycle.offeringTransformationPercentComplete = 100 * (currentBatch / numBatches);
                    return cycle;
                })
                .then(cycleRepository.update);
        }

        /*
         * http://stackoverflow.com/questions/11345296/partitioning-in-javascript/11345570#11345570
         */
        function partitionOfferingsList( list, numParts ) {
            var partLength = Math.floor(list.length / numParts);

            var result = _.groupBy(list, function(item , i) {
                return Math.floor(i/partLength);
            });
            return _.values(result);
        }
    }
}

function copyOfferingHistoryForYear(offering, year) {
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
                    //console.warn('*** Cannot find reference in database to either cycle, library, or product in
                    // offering ', err);
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
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsForLibraryId', libraryId.toString()), cycle )
        .then(initializeComputedValues);
}

function listOfferingsForProductId( productId, cycle ) {
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsForProductId', productId), cycle )
        .then(initializeComputedValues);
}

function listOfferingsWithSelections( cycle ) {
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsWithSelections'), cycle )
        .then(initializeComputedValues);

}

function initializeComputedValues(offerings) {
    offerings.forEach(function(offering){
        offering.display = offering.display || "with-price";

        offering.flagged = getFlaggedState(offering);

        if (!offering.libraryComments) {
            offering.libraryComments = offering.product.comments;
        }

        sortOfferingSuPricing(offering);
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
            var flagSiteLicensePrice = isThereAnSuOfferingForLessThanTheSiteLicensePrice();
            var flagSuPrices = isThereAnSuOfferingForMoreUsersWithASmallerPrice();

            return flagSiteLicensePrice || flagSuPrices;
        }
        return false;
    }

    function isThereAnSuOfferingForLessThanTheSiteLicensePrice(){
        var sitePrice = offering.pricing.site || 0;
        for ( var i in offering.pricing.su ){
            if ( offering.pricing.su[i].price > sitePrice ){
                return true;
            }
        }
        return false;
    }

    function isThereAnSuOfferingForMoreUsersWithASmallerPrice(){
        sortOfferingSuPricing(offering);
        var max = offering.pricing.su.length;

        for ( var i = 0 ; i < max ; i++ ){
            var priceToCheck = offering.pricing.su[i].price;
            for ( var j = i ; j < max ; j++ ){
                if ( offering.pricing.su[j].price > priceToCheck ){
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
    return expandOfferings(couchUtils.getCouchDocuments(cycle.getDatabaseName(), ids), cycle);
}

function getOfferingDisplayOptions(){
    return Validator.getEnumValuesFor('Offering','display');
}

function listVendorsFromOfferingIds( listOfOfferingIds, cycle ){
    return getOfferingsById( listOfOfferingIds, cycle )
        .then(getVendorListFromOfferings);


    function getVendorListFromOfferings(offerings) {
        return offerings.map(getVendorIdFromOffering).filter(discardDuplicateIds);

        function getVendorIdFromOffering(offering) {
            return offering.product.vendor;
        }

        function discardDuplicateIds(value, index, self) {
            return self.indexOf(value) === index;
        }
    }
}

function createOfferingsFor( productId, libraryIds, cycle ){
    setCycle(cycle);

    return Q.all( libraryIds.map(createOfferingForLibrary) );

    function createOfferingForLibrary( libraryId ){
        var newOffering = {
            type: 'Offering',
            cycle: cycle,
            library: libraryId.toString(),
            product: productId,
            pricing: {}
        };
        return createOffering( newOffering, cycle );
    }
}

function sortOfferingSuPricing( offering ){
    if ( offering.pricing.su ){
        offering.pricing.su.sort(sortByUsers);
    }

    function sortByUsers(a, b) {
        return a.users > b.users;
    }
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
    listOfferingsWithSelections: listOfferingsWithSelections,
    listVendorsFromOfferingIds: listVendorsFromOfferingIds,
    createOfferingsFor: createOfferingsFor,

    getOfferingsById: getOfferingsById,
    getOfferingDisplayOptions: getOfferingDisplayOptions,
    transformOfferingsForNewCycle: transformOfferingsForNewCycle,
    copyOfferingHistoryForYear: copyOfferingHistoryForYear,

    getFlaggedState: getFlaggedState
};
