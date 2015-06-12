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
                    console.warn('*** Cannot find reference in database to either vendor or license in product ', err);
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
    ProductRepository.setStore(getStoreForCycle(cycle));
}

function getProductsById( ids, cycle ){
    return couchUtils.getCouchDocuments(cycle.getDatabaseName(), ids);
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

function setStore(store) {
    ProductRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
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
    isProductActive: isProductActive
};
