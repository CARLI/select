angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, vendorService ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    productModule.setStore( productStore );

    function listProducts() {
        return expandReferencesToObjects( $q.when(productModule.list()) );
    }

    function listAvailableOneTimePurchaseProducts() {
        return expandReferencesToObjects( $q.when(productModule.listAvailableOneTimePurchaseProducts()) );
    }

    return {
        list: listProducts,
        listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts,
        create: function(product) {
            transformObjectsToReferences(product);
            return $q.when( productModule.create(product) );
        },
        update: function(product) {
            var deferred = $q.defer();

            var savedVendorObject = product.vendor;
            transformObjectsToReferences(product);

            productModule.update(product)
                .then (function(product) {
                    deferred.resolve(product);
                })
                .catch(function (err) {
                    deferred.reject(err);
                })
                .finally(function(){
                    product.vendor = savedVendorObject;
                });

            return deferred.promise;
        },
        load: function(id) {
            var deferred = $q.defer();

            productModule.load(id)
                .then(function(product){
                    fetchObjectsForReferences(product)
                        .then( function( vendor ){
                            transformReferencesToObjects(product, vendor);
                            deferred.resolve(product);
                        });
                })
                .catch(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }
    };

    function transformObjectsToReferences(product) {
        if (typeof product.vendor === 'object') {
            product.vendor = product.vendor.id;
        }
    }

    function transformReferencesToObjects(product, object) {
        product.vendor = object;
    }

    function fetchObjectsForReferences(product) {
        return vendorService.load( product.vendor );
    }

    function expandReferencesToObjects(listPromise) {
        var list;
        var deferred = $q.defer();
        var promises = [ listPromise ];

        listPromise.then(function (products) {
            list = products;
            products.forEach(function (product) {
                var p = fetchObjectsForReferences(product);
                p.then(function (vendor) {
                    transformReferencesToObjects(product, vendor);
                }).catch(function (err) {
                    deferred.reject(err);
                });
                promises.push(p);
            });
        }).catch(function (err) {
            deferred.reject(err);
        });

        $q.all(promises).then(function () {
            deferred.resolve(list);
        });
        return deferred.promise;
    }
}
