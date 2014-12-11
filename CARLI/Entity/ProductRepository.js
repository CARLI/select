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

function createProduct( product ){
    return ProductRepository.create( product );
}

function updateProduct( product ){
    return ProductRepository.update( product );
}

function listProducts(){
    return ProductRepository.list();
}

function loadProduct( productId ){

    //var deferred = $q.defer();

    return ProductRepository.load( productId );

/*
    ProductRepository.load( productId )
        .then(function (product) {

            entityBaseService.fetchAndTransformObjectsFromReferences(product, references)
                .then(function (product) {
                    deferred.resolve(product);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
*/

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

module.exports = {
    setStore: ProductRepository.setStore,
    create: createProduct,
    update: updateProduct,
    list: listProducts,
    load: loadProduct,
    listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts
};
