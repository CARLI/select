var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , CycleRepository = require('./CycleRepository')
  , config = require( '../../config' )
  , CouchUtils = require( '../Store/CouchDb/Utils')
  , Validator = require('../Validator')
  , moment = require('moment')
  , Q = require('q')
  ;

var ProductRepository = Entity('Product');

var propertiesToTransform = ['cycle', 'vendor', 'license'];

function transformFunction( product ){
    EntityTransform.transformObjectForPersistence(product, propertiesToTransform);
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
    return EntityTransform.expandListOfObjectsFromPersistence( ProductRepository.list(cycle.databaseName), propertiesToTransform, functionsToAdd);
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
    return CouchUtils.getCouchViewResultValues(cycle.databaseName, 'listProductsByLicenseId', licenseId);
}

function listProductsForVendorId( vendorId, cycle ) {
    setCycle(cycle);
    return CouchUtils.getCouchViewResultValues(cycle.databaseName, 'listProductsForVendorId', vendorId);
}

function listProductCountsByVendorId(cycle){
    setCycle(cycle);
    return CouchUtils.getCouchViewResultObject(cycle.databaseName, 'listProductCountsByVendorId', null, true);
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    ProductRepository.setStore(CycleRepository.getStoreForCycle(cycle));
}


/* functions that get added as instance methods on loaded Products */
var getIsActive = function(){
    if ( this.vendor && this.vendor.isActive != undefined) {
        return this.isActive && this.vendor.isActive;
    }
    return this.isActive;
};

var functionsToAdd = {
    'getIsActive': getIsActive
};

function getProductDetailCodeOptions(){
    return Validator.getEnumValuesFor('ProductDetailCodes');
}

module.exports = {
    setStore: ProductRepository.setStore,
    setCycle: setCycle,
    create: createProduct,
    update: updateProduct,
    list: listProducts,
    load: loadProduct,
    listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts,
    listProductsForLicenseId: listProductsForLicenseId,
    listProductsForVendorId: listProductsForVendorId,
    listProductCountsByVendorId: listProductCountsByVendorId,
    getProductDetailCodeOptions: getProductDetailCodeOptions
};
