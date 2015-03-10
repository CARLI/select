var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , CycleRepository = require('./CycleRepository')
  , config = require( '../../config' )
  , CouchUtils = require( '../Store/CouchDb/Utils')
  , getStoreForCycle = require('./getStoreForCycle')
  , Validator = require('../Validator')
  , moment = require('moment')
  , listProductsWithOfferingsForVendorIdModule = require('../../config/environmentDependentModules/listProductsWithOfferingsForVendorId')
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
    return expandProducts( ProductRepository.list(cycle.databaseName), cycle );
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
    return expandProducts(CouchUtils.getCouchViewResultValues(cycle.databaseName, 'listProductsByLicenseId', licenseId), cycle);
}

function listProductsForVendorId( vendorId, cycle ) {
    setCycle(cycle);
    return expandProducts(CouchUtils.getCouchViewResultValues(cycle.databaseName, 'listProductsForVendorId', vendorId), cycle);
}

function listProductsWithOfferingsForVendorId( vendorId, cycle ) {
    return listProductsWithOfferingsForVendorIdModule.listProductsWithOfferingsForVendorId(vendorId, cycle.id);
}

function listProductCountsByVendorId(cycle){
    setCycle(cycle);
    return CouchUtils.getCouchViewResultObject(cycle.databaseName, 'listProductCountsByVendorId', null, true);
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    ProductRepository.setStore(getStoreForCycle(cycle));
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
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId,
    listProductCountsByVendorId: listProductCountsByVendorId,
    getProductDetailCodeOptions: getProductDetailCodeOptions
};
