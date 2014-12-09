angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, entityBaseService, licenseService, vendorService ) {

    var productModule = CarliModules.Product;
    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );
    productModule.setStore( productStore );

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

    function listProducts() {
        return expandReferencesToObjects($q.when(productModule.list()));
    }

    function listAvailableOneTimePurchaseProducts() {
        return expandReferencesToObjects($q.when(productModule.listAvailableOneTimePurchaseProducts()));
    }

    function transformObjectsToReferences(product) {
        entityBaseService.transformObjectsToReferences(product, [ 'vendor', 'license' ]);
    }

    function fetchAndTransformObjectsForReferences(product) {
        return entityBaseService.fetchObjectsForReferences(product, { 'vendor': vendorService, 'license': licenseService })
            .then( function( resolvedObjects ){
                entityBaseService.transformReferencesToObjects(product, resolvedObjects);
                return product;
            });
    }

    function expandReferencesToObjects(p) {
        var list;
        var deferred = $q.defer();

        var promises = [ p ];

        p.then(function (entities) {
            list = entities;
            entities.forEach(function (entity) {
                var p = fetchAndTransformObjectsForReferences(entity);
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
