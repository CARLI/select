var config = require('../../config');
var couchUtils = require('../Store/CouchDb/Utils')();
var cycleRepository = require('./CycleRepository');
var Entity = require('../Entity');
var EntityTransform = require('./EntityTransformationUtils');
var getStoreForCycle = require('./getStoreForCycle');
var libraryRepository = require('./LibraryRepository');
var productRepository = require('./ProductRepository');
var Q = require('q');
var uuid = require('node-uuid');
var Validator = require('../Validator');
var _ = require('lodash');

var storeOptions = {};
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
    return expandOfferings( listOfferingsUnexpanded(cycle), cycle);
}

function listOfferingsUnexpanded(cycle){
    setCycle(cycle);
    return OfferingRepository.list(cycle.getDatabaseName())
}

function transformOfferingsForNewCycle(newCycle, sourceCycle) {
    return listUnexpandedOfferings(newCycle).then(function(offerings) {
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
            // Logger.log('[Cycle Creation]: Transforming offerings ' + (currentBatch + 1) + '/' + numBatches);
            return transformOfferingsBatch(offeringsPartitions[currentBatch])
                .then(incrementBatch)
                .then(updateProgress)
                .then(updateNextBatch);
        }

        function transformOfferingsBatch(offeringsBatch) {
            offeringsBatch.forEach(function (offering) {
                copyOfferingHistoryForYear(offering, sourceCycle.year);
                removeVendorModificationTracking(offering);
                removeSelection(offering);
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

function removeVendorModificationTracking(offering){
    delete offering.siteLicensePriceUpdated;
    delete offering.suPricesUpdated;
}

function removeSelection(offering){
    delete offering.selection;
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

function listOfferingsForProductIdUnexpanded(productId, cycle, offeringLimit) {
    var getOfferings = Q([]);

    if (offeringLimit) {
        getOfferings = couchUtils.getCouchViewResultValuesWithLimit(cycle.getDatabaseName(), 'listOfferingsForProductId', productId, offeringLimit);
    }
    else {
        getOfferings = couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsForProductId', productId);
    }
    return getOfferings;
}

function listOfferingsForProductId( productId, cycle, offeringLimit ) {
    setCycle(cycle);
    var getOfferings = listOfferingsForProductIdUnexpanded(productId, cycle, offeringLimit  );
    return expandOfferings( getOfferings, cycle ).then(initializeComputedValues);
}

function listOfferingsForVendorId( vendorId, cycle ) {
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsForVendorId', vendorId), cycle )
        .then(initializeComputedValues);
}

function listOfferingsWithSelections( cycle ) {
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsWithSelections'), cycle )
        .then(initializeComputedValues);
}

function listOfferingsWithSelectionsUnexpanded( cycle ) {
    setCycle(cycle);
    return couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsWithSelections');
}

function listOfferingsWithSelectionsForLibrary( libraryId, cycle ){
    setCycle(cycle);
    return expandOfferings( couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsWithSelections', libraryId), cycle )
}

function listSelectedProductsFromActiveCyclesForLibrary(library) {
    var consolidatedOfferingsById = {};

    return cycleRepository.listActiveCycles()
        .then(sortCyclesByYear)
        .then(listProductsForAllCyclesForLibrary)
        .then(returnConsolidatedProductList);

    function listProductsForAllCyclesForLibrary(cycles) {
        var offeringPromises = [];

        cycles.forEach(listOfferingsFromCycle);

        return Q.all(offeringPromises);

        function listOfferingsFromCycle(cycle) {
            var listOfferingsPromise = listOfferingsWithSelectionsForLibrary(library.id, cycle)
                .then(addToList);

            offeringPromises.push(listOfferingsPromise);

            function addToList(offerings) {
                offerings.forEach(function (product) {
                    if (!consolidatedOfferingsById.hasOwnProperty(product.id)) {
                        consolidatedOfferingsById[product.id] = product;
                    }
                });
                return offerings;
            }
        }
    }
    function returnConsolidatedProductList() {
        var products = [];

        Object.keys(consolidatedOfferingsById).forEach(function (productId) {
            products.push(consolidatedOfferingsById[productId]);
        });

        return sortArrayOfObjectsByKeyAscending(products, 'name');
    }
}

function setSuPricingForAllLibrariesForProduct( productId, newSuPricing, cycle ){
    return listOfferingsForProductIdUnexpanded(productId, cycle)
        .then(applyNewSuPricingToAllOfferings);

    function applyNewSuPricingToAllOfferings( listOfOfferings ){
        return listOfOfferings.map( applyNewSuPricingToOffering );

        function applyNewSuPricingToOffering( offering ){
            offering.pricing = offering.pricing || {};
            offering.pricing.su = newSuPricing.slice(0);
            offering.suPricesUpdated = new Date().toISOString();
            return offering;
        }
    }
}

function updateSuPricingForAllLibrariesForProduct( vendorId, productId, newSuPricing, cycle ){
    return setSuPricingForAllLibrariesForProduct( productId, newSuPricing, cycle )
        .then(function( offerings ){
            return couchUtils.bulkUpdateDocuments(cycle.getDatabaseName(), offerings);
        })
        .then(returnSuccessfulBulkUpdateIds);
}

function updateSuCommentForAllLibrariesForProduct(vendorId, productId, numSu, newCommentText, cycle) {
    return listOfferingsForProductIdUnexpanded(productId, cycle)
        .then(removeExistingSuComment)
        .then(addNewSuComment)
        .then(updateOfferings);

    function removeExistingSuComment(offerings) {
        return offerings.map( removeComment );

        function removeComment(offering) {
            if (offering.vendorComments && offering.vendorComments.su) {
                offering.vendorComments.su = offering.vendorComments.su.filter(filterSuComment);
            }

            return offering;

            function filterSuComment(suComment) {
                return suComment.users != numSu;
            }
        }
    }

    function addNewSuComment(offerings) {
        return offerings.map(addNewComment);

        function addNewComment(offering) {
            offering.vendorComments = offering.vendorComments || {};
            offering.vendorComments.su = offering.vendorComments.su || [];

            offering.vendorComments.su.push({
                users: numSu,
                comment: newCommentText
            });

            return offering;
        }
    }

    function updateOfferings(offerings) {
        return couchUtils.bulkUpdateDocuments(cycle.getDatabaseName(), offerings)
            .then(returnSuccessfulBulkUpdateIds);
    }
}

function returnSuccessfulBulkUpdateIds( bulkUpdateStatusArray ){
    return bulkUpdateStatusArray.filter(wasSuccessfulUpdate).map(getUpdatedId);

    function wasSuccessfulUpdate( bulkUpdateStatusObject ){
        return bulkUpdateStatusObject && bulkUpdateStatusObject.ok;
    }

    function getUpdatedId( bulkUpdateStatusObject ){
        return bulkUpdateStatusObject.id;
    }
}

function ensureProductHasOfferingsForAllLibraries( productId, vendorId, cycle ){
    var offeringList = [];
    var librariesThatAlreadyHaveOfferings = [];

    return listOfferingsForProductIdUnexpanded(productId, cycle)
        .then(function( offerings ){
            offeringList = offerings;
            return libraryRepository.listActiveLibraries();
        })
        .then(function(libraryList){
            librariesThatAlreadyHaveOfferings = offeringList.map(getLibraryFromOffering);
            var missingLibraryIds = libraryList.filter(libraryDoesNotAlreadyHaveOffering).map(getIdFromLibrary);
            return createOfferingsFor(productId, vendorId, missingLibraryIds, cycle);
        });

    function getLibraryFromOffering(offering){
        return offering.library;
    }

    function getIdFromLibrary(library){
        return library.id;
    }

    function libraryDoesNotAlreadyHaveOffering(library){
        return librariesThatAlreadyHaveOfferings.indexOf(library.id) === -1;
    }
}

function bulkUpdateOfferings( listOfOfferings, cycle ){
    var transformedOfferings = listOfOfferings.map(transformOfferingForUpdate);

    return Q.all( transformedOfferings.map(Validator.validate) )
        .then(bulkUpdateOfferings)
        .then(returnSuccessfulBulkUpdateIds);

    function transformOfferingForUpdate(offering){
        transformFunction(offering);
        transformCycleReference(offering, cycle);
        return offering;
    }

    function bulkUpdateOfferings(){
        return couchUtils.bulkUpdateDocuments(cycle.getDatabaseName(), transformedOfferings);
    }
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
    setStore(getStoreForCycle(cycle, storeOptions));
}


function getFlaggedState(offering, cycleArgument) {
    cycle = getCycleFromArguments();
    var thisYear = cycle.year || 1;
    var lastYear = thisYear - 1;

    function getCycleFromArguments() {
        var c = cycleArgument || offering.cycle;

        if (!c || typeof c === 'string') {
            throw new Error('Invalid cycle');
        }

        return c;
    }

    if ( userFlaggedState() !== undefined ){
        return userFlaggedState();
    }

    return systemFlaggedState();


    function userFlaggedState(){
        if (offering.flagged) {
            offering.flaggedReason = ['flagged by CARLI staff'];
        }
        return offering.flagged;
    }

    function systemFlaggedState(){
        if ( offering.pricing && offering.pricing.su && vendorHasTouchedPricing(offering) ){
            var flagSiteLicensePrice = isThereAnSuOfferingForMoreThanTheSiteLicensePrice();
            var flagSuPrices = isThereAnSuOfferingForMoreUsersWithASmallerPrice();
            var flagExceedsPriceCap = doesIncreaseFromLastYearExceedPriceCap();
            var flagGreaterThan5PercentReduction = doesDecreaseFromLastYearExceed5Percent();

            /**
             * Reasons should read well in either form:
             * 1 price was flagged because it was REASON
             * 7 prices were flagged because they were REASON
             */
            var flagReasons = [];
            if (flagSiteLicensePrice) {
                flagReasons.push('a site license price for less than a SU price');
            }
            if (flagSuPrices) {
                flagReasons.push('for a SU level with a higher price than the price for a greater number of users');
            }
            if (flagExceedsPriceCap) {
                flagReasons.push('increased by more than the price cap');
            }
            if (flagGreaterThan5PercentReduction) {
                flagReasons.push('decreased by more than 5% compared to last year');
            }
            offering.flaggedReason  = flagReasons;
            return flagSiteLicensePrice || flagSuPrices || flagExceedsPriceCap || flagGreaterThan5PercentReduction;
        }
        return false;
    }

    function isThereAnSuOfferingForMoreThanTheSiteLicensePrice(){
        var sitePrice = offering.pricing.site;
        var hasSitePrice = ('site' in offering.pricing && sitePrice !== null && typeof sitePrice !== 'undefined');

        if ( hasSitePrice ) {
            for (var i in offering.pricing.su) {
                if (offering.pricing.su[i].price !== 0) {
                    if (offering.pricing.su[i].price > sitePrice) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function isThereAnSuOfferingForMoreUsersWithASmallerPrice(){
        sortOfferingSuPricing(offering);
        var max = offering.pricing.su.length;

        for ( var i = 0 ; i < max ; i++ ){
            var priceToCheck = offering.pricing.su[i].price;

            for ( var j = i + 1 ; j < max ; j++ ){
                if ( offering.pricing.su[j].price >= priceToCheck ){
                    return true;
                }
            }
        }
        return false;
    }

    function doesIncreaseFromLastYearExceedPriceCap() {
        var exceedsPriceCap = false;

        var priceCapMultiplier = 1 + (offering.product.priceCap / 100);

        if (canEnforcePriceCap()) {
            checkSitePriceIncrease();
            offering.pricing.su.forEach(checkSuPriceIncrease);
        }
        return exceedsPriceCap;

        function canEnforcePriceCap() {
            var knowLastYear = (lastYear > 0);
            return knowLastYear &&
                   offering.product.priceCap &&
                   offering.history &&
                   offering.history[lastYear] &&
                   offering.history[lastYear].pricing;
        }
        function checkSitePriceIncrease() {
            if (offering.pricing.site > priceCapMultiplier * offering.history[lastYear].pricing.site) {
                exceedsPriceCap = true;
            }
        }
        function checkSuPriceIncrease(suPricing) {
            var priceToCheck = suPricing.price;
            var lastYearsPrice = lookupLastYearsPriceForSu(offering, suPricing.users);
            if ( lastYearsPrice && priceToCheck > priceCapMultiplier * lastYearsPrice ){
                exceedsPriceCap = true;
            }
        }
    }

    function doesDecreaseFromLastYearExceed5Percent() {
        var exceedsDecreaseLimit = false;

        var multiplier = 0.95;

        if (canEnforceDecrease()) {
            checkSitePriceDecrease();
            offering.pricing.su.forEach(checkSuPriceDecrease);
        }

        return exceedsDecreaseLimit;

        function canEnforceDecrease() {
            var knowLastYear = (lastYear > 0);
            return knowLastYear &&
                   offering.history &&
                   offering.history[lastYear] &&
                   offering.history[lastYear].pricing;
        }
        function checkSitePriceDecrease() {
            if (offering.pricing.site < multiplier * offering.history[lastYear].pricing.site) {
                exceedsDecreaseLimit = true;
            }
        }
        function checkSuPriceDecrease(suPricing) {
            var priceToCheck = suPricing.price;
            var lastYearsPrice = lookupLastYearsPriceForSu(offering, suPricing.users);
            if ( lastYearsPrice && priceToCheck < multiplier * lastYearsPrice ){
                exceedsDecreaseLimit = true;
            }
        }
    }

    function lookupLastYearsPriceForSu(offering, suToFind) {
        var lastYearsPrice = null;
        if (offering.history) {
            offering.pricing.su.forEach(findLastYearsPricingForSu);
        }
        return lastYearsPrice;

        function findLastYearsPricingForSu(suPricing) {
            if (suPricing.users === suToFind) {
                offering.history[lastYear].pricing.su.forEach(function (lastYearsPricing) {
                    if (suPricing.users === lastYearsPricing.users) {
                        lastYearsPrice = lastYearsPricing.price;
                    }
                });
            }
        }
    }
}

function vendorHasTouchedPricing(offering){
    return vendorHasTouchedSiteLicensePricing(offering) || vendorHasTouchedSuPricing(offering);
}

function vendorHasTouchedSiteLicensePricing(offering){
    return !!offering.siteLicensePriceUpdated;
}

function vendorHasTouchedSuPricing(offering){
    return !!offering.suPricesUpdated;
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

function createOfferingsFor( productId, vendorId, libraryIds, cycle ){
    setCycle(cycle);

    var offeringsToCreate = libraryIds.map(createOfferingForLibrary);

    return couchUtils.bulkUpdateDocuments(cycle.getDatabaseName(), offeringsToCreate)
        .then(returnSuccessfulBulkUpdateIds);

    /*return Q.all( offeringsToCreate.map(function(offering){
        return createOffering(offering, cycle);
    }) );*/

    function createOfferingForLibrary( libraryId ){
        var newId = uuid.v4();
        return {
            _id: newId,
            id: newId,
            type: 'Offering',
            cycle: cycle,
            library: libraryId.toString(),
            product: productId,
            vendorId: vendorId,
            pricing: {
                site: 0,
                su: []
            }
        };
    }
}

function isFunded(offering) {
    var funding = offering.funding;

    return (hasFundingData() && isFundedByPercentOrPrice());

    function hasFundingData() {
        return !!funding;
    }

    function isFundedByPercentOrPrice() {
        return isFundedByPercent() || isFundedByPrice();
    }

    function isFundedByPercent() {
        return funding.fundedByPercentage && funding.fundedPercent > 0;
    }

    function isFundedByPrice() {
        return !funding.fundedByPercentage && funding.fundedPrice > 0;
    }
}

function getFundedSelectionPrice(offering) {
    if (!offering.selection) {
        return null;
    }
    return getFundedPrice(offering.selection.price, offering.funding);
}

function getFundedSelectionPendingPrice(offering) {
    if (!offering.selectionPendingReview) {
        return null;
    }
    return getFundedPrice(offering.selectionPendingReview.price, offering.funding);
}

function getFundedSiteLicensePrice(offering) {
    if (!offering.pricing) {
        return null;
    }
    return getFundedPrice(offering.pricing.site, offering.funding);
}

function getAmountPaidByCarli(offering) {
    var amountPaidByLibrary = getFundedSelectionPrice(offering);
    var totalAmount = offering.selection.price;

    return totalAmount - amountPaidByLibrary;
}

function getFundedPrice(price, funding) {
    var fundedPrice = price;

    if (funding) {
        calculateFundedPrice();
    }

    return fundedPrice;

    function calculateFundedPrice() {
        if (funding.fundedByPercentage) {
            calculateFundedPriceByPercent();
        } else if (funding.fundedPrice) {
            calculateFundedPriceByAmount();
        }
    }
    function calculateFundedPriceByPercent() {
        var percent = (funding.fundedPercent / 100);
        fundedPrice = roundToNearestCent(price - (percent * price));
    }
    function calculateFundedPriceByAmount() {
        fundedPrice = funding.fundedPrice;
    }
}

function roundToNearestCent(amount) {
    return Math.round(100 * amount) / 100;
}

function sortOfferingSuPricing( offering ){
    if ( offering.pricing.su ){
        offering.pricing.su.sort(sortByUsers);
    }

    function sortByUsers(a, b) {
        return a.users < b.users;
    }
}

function setStore(store) {
    storeOptions = store.getOptions();
    OfferingRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(storeOptions);
}

function sortCyclesByYear(cycles) {
    return sortArrayOfObjectsByKeyDescending(cycles, 'year');
}

function sortArrayOfObjectsByKeyAscending(arr, key) {
    return arr.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function sortArrayOfObjectsByKeyDescending(arr, key) {
    return arr.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return -1 * ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

module.exports = {
    setStore: setStore,
    setCycle: setCycle,
    create: createOffering,
    update: updateOffering,
    list: listOfferings,
    listOfferingsUnexpanded: listOfferingsUnexpanded,
    load: loadOffering,
    delete: deleteOffering,

    listOfferingsForLibraryId: listOfferingsForLibraryId,
    listOfferingsForProductId: listOfferingsForProductId,
    listOfferingsForVendorId: listOfferingsForVendorId,
    listOfferingsForProductIdUnexpanded: listOfferingsForProductIdUnexpanded,
    listOfferingsWithSelections: listOfferingsWithSelections,
    listOfferingsWithSelectionsUnexpanded: listOfferingsWithSelectionsUnexpanded,
    listOfferingsWithSelectionsForLibrary: listOfferingsWithSelectionsForLibrary,
    listSelectedProductsFromActiveCyclesForLibrary: listSelectedProductsFromActiveCyclesForLibrary,
    setSuPricingForAllLibrariesForProduct: setSuPricingForAllLibrariesForProduct,
    updateSuPricingForAllLibrariesForProduct: updateSuPricingForAllLibrariesForProduct,
    updateSuCommentForAllLibrariesForProduct: updateSuCommentForAllLibrariesForProduct,
    listVendorsFromOfferingIds: listVendorsFromOfferingIds,
    createOfferingsFor: createOfferingsFor,
    ensureProductHasOfferingsForAllLibraries: ensureProductHasOfferingsForAllLibraries,
    bulkUpdateOfferings: bulkUpdateOfferings,

    getOfferingsById: getOfferingsById,
    getOfferingDisplayOptions: getOfferingDisplayOptions,
    transformOfferingsForNewCycle: transformOfferingsForNewCycle,
    copyOfferingHistoryForYear: copyOfferingHistoryForYear,

    getFlaggedState: getFlaggedState,
    siteLicenseSelectionUsers: 'Site License',
    isFunded: isFunded,
    getFundedSelectionPrice: getFundedSelectionPrice,
    getFundedSelectionPendingPrice: getFundedSelectionPendingPrice,
    getFundedSiteLicensePrice: getFundedSiteLicensePrice,
    getAmountPaidByCarli: getAmountPaidByCarli
};
