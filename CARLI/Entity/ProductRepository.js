var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , CycleRepository = require('./CycleRepository')
  , config = require( '../../config' )
  , couchUtils = require( '../Store/CouchDb/Utils')()
  , getStoreForCycle = require('./getStoreForCycle')
  , Validator = require('../Validator')
  , moment = require('moment')
  , Q = require('q')
  ;

var storeOptions = {};
var ProductRepository = Entity('Product');

var propertiesToTransform = ['cycle', 'vendor', 'license'];

function transformFunction( product ){
    EntityTransform.transformObjectForPersistence(product, propertiesToTransform);
}

function expandProducts( listPromise, cycle ){
    return EntityTransform.expandListOfObjectsFromPersistence( listPromise, propertiesToTransform, functionsToAdd);
}


function createProduct( product, cycle ){
    setCycle(cycle);
    return ProductRepository.create( product, transformFunction );
}

function updateProduct( product, cycle ){
    setCycle(cycle);
    return ProductRepository.update( product, transformFunction );
}

function listProducts(cycle){
    setCycle(cycle);
    return expandProducts( ProductRepository.list(cycle.getDatabaseName()), cycle );
}

function loadProduct( productId, cycle ){
    var deferred = Q.defer();

    setCycle(cycle);
    ProductRepository.load( productId )
        .then(function (product) {
            EntityTransform.expandObjectFromPersistence( product, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(product);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database to either vendor or license in product ', err);
                    deferred.resolve(product);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function listAvailableOneTimePurchaseProducts(){
    var deferred = Q.defer();

    CycleRepository.load(config.oneTimePurchaseProductsCycleDocId).then(function (cycle) {
        listProducts(cycle)
            .then(function (allProducts) {
                var p = allProducts
                    .filter(isActive)
                    .filter(isAvailableToday);
                deferred.resolve(p);
            })
            .catch(function (err) {
                deferred.reject(err);
            });
    });

    return deferred.promise;
}

function isActive( product ){
    return product.getIsActive();
}
function isAvailableToday( product ){
    var throughDate = moment(product.oneTimePurchase.availableForPurchaseThrough);
    var lastMidnight = moment().startOf('day');
    return throughDate.isAfter(lastMidnight);
}

function listProductsForLicenseId( licenseId, cycle ) {
    setCycle(cycle);
    return expandProducts(couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listProductsByLicenseId', licenseId), cycle);
}

function listProductsForVendorId( vendorId, cycle ) {
    setCycle(cycle);
    return expandProducts(couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listProductsForVendorId', vendorId), cycle);
}

function listActiveProductsForVendorId( vendorId, cycle ){
    return listProductsForVendorId(vendorId,cycle)
        .then(filterActiveProducts);

    function filterActiveProducts( productList ){
        return productList.filter(function(product){
            return product.getIsActive();
        });
    }
}

function listProductCountsByVendorId(cycle){
    setCycle(cycle);
    return couchUtils.getCouchViewResultObject(cycle.getDatabaseName(), 'listProductCountsByVendorId', null, true);
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    setStore(getStoreForCycle(cycle, storeOptions));
}

function getProductsById( ids, cycle ){
    return couchUtils.getCouchDocuments(cycle.getDatabaseName(), ids);
}

function getProductSelectionStatisticsForCycle( productId, cycle ){
    if ( !productId ){
        return Q.reject('getProductSelectionStatisticsForCycle: product Id required');
    }

    if ( !cycle || !cycle.getDatabaseName ){
        return Q.reject('getProductSelectionStatisticsForCycle: fully expanded cycle required');
    }

    return couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listOfferingsForProductId', productId)
        .then(function(offerings){
            return {
                numberOffered: offerings.length,
                numberSelected: offerings.filter(selected).length,
                minPrice: minPrice(offerings),
                maxPrice: maxPrice(offerings)
            };
        });

    function selected(offering){
        return offering.selection;
    }

    function minPrice(offeringsList){
        var minPriceSoFar = Infinity;

        offeringsList.forEach(function(offering){
            if ( offering.pricing ){
                var minSuPrice = offering.pricing.su ? findMinSuPrice(offering.pricing.su) : Infinity;
                var minPriceForOffering = Math.min(minSuPrice, offering.pricing.site);

                if ( minPriceForOffering < minPriceSoFar ){
                    minPriceSoFar = minPriceForOffering;
                }
            }
        });

        return minPriceSoFar;
    }

    function maxPrice(offeringsList){
        var maxPriceSoFar = 0;

        offeringsList.forEach(function(offering){
            if ( offering.pricing ){
                var maxSuPrice = offering.pricing.su ? findMaxSuPrice(offering.pricing.su) : 0;
                var maxPriceForOffering = Math.max(maxSuPrice, offering.pricing.site);

                if ( maxPriceForOffering > maxPriceSoFar ){
                    maxPriceSoFar = maxPriceForOffering;
                }
            }
        });

        return maxPriceSoFar;
    }

    function findMinSuPrice( listOfSuPricingObjects ){
        var minSuPrice = Infinity;

        listOfSuPricingObjects.forEach(function(suPricing){
            if ( suPricing.price < minSuPrice ){
                minSuPrice = suPricing.price;
            }
        });

        return minSuPrice;
    }

    function findMaxSuPrice( listOfSuPricingObjects ){
        var maxSuPrice = 0;

        listOfSuPricingObjects.forEach(function(suPricing){
            if ( suPricing.price > maxSuPrice ){
                maxSuPrice = suPricing.price;
            }
        });

        return maxSuPrice;
    }
}

/* functions that get added as instance methods on loaded Products */
var getIsActive = function(){
    return isProductActive(this);
};

function isProductActive( product ){
    var vendorIsActive = true;
    var licenseIsActive = true;

    if ( product.vendor && product.vendor.isActive != undefined) {
        vendorIsActive = product.vendor.isActive;
    }

    if ( product.license && product.license.isActive != undefined) {
        licenseIsActive = product.license.isActive;
    }

    return product.isActive && vendorIsActive && licenseIsActive;
}

var functionsToAdd = {
    'getIsActive': getIsActive
};

function getProductDetailCodeOptions(){
    return Validator.getEnumValuesFor('ProductDetailCodes');
}

var COUNT = 0;
function setStore(store) {
    COUNT++;
    console.log(COUNT + " PRODUCT REPOSITORY setStore()", store.getOptions());
    storeOptions = store.getOptions();
    ProductRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(storeOptions);
}

module.exports = {
    setStore: setStore,
    setCycle: setCycle,
    create: createProduct,
    update: updateProduct,
    list: listProducts,
    load: loadProduct,
    listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts,
    listProductsForLicenseId: listProductsForLicenseId,
    listProductsForVendorId: listProductsForVendorId,
    listActiveProductsForVendorId: listActiveProductsForVendorId,
    listProductCountsByVendorId: listProductCountsByVendorId,
    getProductsById: getProductsById,
    getProductDetailCodeOptions: getProductDetailCodeOptions,
    isProductActive: isProductActive,
    getProductSelectionStatisticsForCycle: getProductSelectionStatisticsForCycle
};
