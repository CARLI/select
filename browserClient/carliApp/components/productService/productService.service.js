angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, vendorService ) {

    var productModule = CarliModules.Product;

    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );

    productModule.setStore( productStore );

    function listProducts() {
        var productList;
        var deferred = $q.defer();

        var p = $q.when(productModule.list());
        var promises = [ p ];

        p.then(function (products) {
            productList = products;
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
            deferred.resolve(productList);
        });
        return deferred.promise;
    }

    return {
        list: listProducts,
        listOneTimePurchaseProducts: listProducts,
        create: function(product) {
            transformObjectsToReferences(product);
            return $q.when( productModule.create(product) );
        },
        update: function(product) {
            transformObjectsToReferences(product);
            return $q.when( productModule.update(product) );
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
        product.vendor = product.vendor.id;
    }

    function transformReferencesToObjects(product, object) {
        product.vendor = object;
    }

    function fetchObjectsForReferences(product) {
        return vendorService.load( product.vendor );
    }
}
