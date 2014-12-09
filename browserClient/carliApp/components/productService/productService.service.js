angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, entityBaseService, vendorService ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    productModule.setStore( productStore );

    function listProducts() {
        expandReferencesToObjects($q.when(productModule.list()));
    }
    function listAvailableOneTimePurchaseProducts() {
        expandReferencesToObjects($q.when(productModule.listAvailableOneTimePurchaseProducts()));
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
                .then(function (product) {
                    fetchAndTransformObjectsForReferences(product)
                        .then(function (product) {
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
        entityBaseService.transformObjectsToReferences(product, [ 'vendor' ]);
    }

    function fetchAndTransformObjectsForReferences(product) {
        return entityBaseService.fetchObjectsForReferences(product, { 'vendor': vendorService })
            .then( function( resolvedObjects ){
                entityBaseService.transformReferencesToObjects(product, resolvedObjects);
                return product;
            });
    }

    function expandReferencesToObjects(p) {
        var productList;
        var deferred = $q.defer();

        var promises = [ p ];

        p.then(function (products) {
            productList = products;
            products.forEach(function (product) {
                var p = fetchAndTransformObjectsForReferences(product);
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
            deferred.resolve(productList);
        });
        return deferred.promise;
    }
}
