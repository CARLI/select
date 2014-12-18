var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , config = require( '../config' )
  , request = config.request
  , StoreOptions = config.storeOptions
  , Store = require( '../Store' )
  , StoreModule = require( '../Store/CouchDbStore')
  , moment = require('moment')
  , Q = require('q')
  ;

var dbHost = db_host = StoreOptions.couchDbUrl + '/' + StoreOptions.couchDbName;

var ProductRepository = Entity('Product');
ProductRepository.setStore( Store( StoreModule(StoreOptions) ) );

var propertiesToTransform = ['vendor', 'license'];

function transformFunction( product ){
    EntityTransform.transformObjectForPersistence(product, propertiesToTransform);
}

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

    listProducts()
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

function listProductsForLicenseId( licenseId ) {
    var deferred = Q.defer();

    var url = dbHost + '/' + '_design/CARLI/_view/listProductsByLicenseId?key="' + licenseId + '"';
    var results = [];
    request({ url: url },
        function ( err, response, body ) {
            var data = JSON.parse( body );

            var error = err || data.error;
            if( error ) {
                deferred.reject( error );
            }
            else if (data.rows) {
                data.rows.forEach(function (row) {
                    if (row.value) {
                        results.push(row.value);
                    }
                });
                console.log("---results=", results);
                deferred.resolve(results);
            }
            else {
                deferred.reject();
            }
        }
    );
    return deferred.promise;
}

function isOneTimePurchaseProduct( product ){
    return product.cycleType === 'One-Time Purchase';
}
function isActive( product ){
    return product.getIsActive();
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

var functionsToAdd = {
    'getIsActive': getIsActive
};

module.exports = {
    setStore: ProductRepository.setStore,
    create: createProduct,
    update: updateProduct,
    list: listProducts,
    load: loadProduct,
    listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts,
    listProductsForLicenseId: listProductsForLicenseId
};
