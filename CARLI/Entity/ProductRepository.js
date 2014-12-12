var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , config = require( '../config' )
  , Store = require( '../Store' )
  , StoreModule = require( '../Store/' + config.store )( config.storeOptions )
  , moment = require('moment')
  , Q = require('q')
  ;

var ProductRepository = Entity('Product');
ProductRepository.setStore( Store( StoreModule ) );

var transformFunction = function( product ){
    EntityTransform.transformObjectForPersistence(product, propertiesToTransform);
};

function createProduct( product ){
    return ProductRepository.create( product, transformFunction );
}

function updateProduct( product ){
    return ProductRepository.update( product, transformFunction );
}

function listProducts(){
    return EntityTransform.expandListOfObjectsFromPersistence( ProductRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadProduct( productId ){
    var deferred = Q.defer();

    ProductRepository.load( productId )
        .then(function (product) {
            return EntityTransform.expandObjectFromPersistence( product, propertiesToTransform, functionsToAdd )
                .then(function (product) {
                    deferred.resolve(product);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('Cannot find reference in database to either vendor or license in product ', product);
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

    ProductRepository.list()
        .then(function (allProducts) {
            var p = allProducts
                .filter(isOneTimePurchaseProduct)
                .filter(isActive)
                .filter(isAvailableToday);
            deferred.resolve(p);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

function isOneTimePurchaseProduct( product ){
    return product.cycleType === 'One-Time Purchase';
}
function isActive( product ){
    return product.isActive === true;
}
function isAvailableToday( product ){
    var throughDate = moment(product.oneTimePurchase.availableForPurchaseThrough);
    var lastMidnight = moment().startOf('day');
    return throughDate.isAfter(lastMidnight);
}

/* functions that get added as instance methods on loaded Products */
var getIsActive = function(){
    if ( this.vendor && this.vendor.isActive != undefined) {
        return this.isActive && this.vendor.isActive;
    }
    return this.isActive;
};

var propertiesToTransform = ['vendor', 'license'];

var functionsToAdd = {
    'getIsActive': getIsActive
};

module.exports = {
    setStore: ProductRepository.setStore,
    create: createProduct,
    update: updateProduct,
    list: listProducts,
    load: loadProduct,
    listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts
};
