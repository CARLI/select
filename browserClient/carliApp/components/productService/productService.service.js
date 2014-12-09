angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, entityBaseService, licenseService, vendorService ) {

    var references = { vendor: vendorService, license: licenseService };

    var productModule = CarliModules.Product;
    var productStore = CarliModules.Store( CarliModules[CarliModules.config.store]( CarliModules.config.storeOptions ) );
    productModule.setStore( productStore );

    return {
        list: listProducts,
        listAvailableOneTimePurchaseProducts: listAvailableOneTimePurchaseProducts,
        create: createProduct,
        update: updateProduct,
        load: loadProduct
    };

    function listProducts() {
        return entityBaseService.expandReferencesToObjects($q.when(productModule.list()), references);
    }

    function listAvailableOneTimePurchaseProducts() {
        return entityBaseService.expandReferencesToObjects($q.when(productModule.listAvailableOneTimePurchaseProducts()), references);
    }

    function createProduct(product) {
        entityBaseService.transformObjectsToReferences(product, references);
        return $q.when( productModule.create(product) );
    }

    function updateProduct(product) {
        var deferred = $q.defer();
        var savedObjects = entityBaseService.saveReferences(product, references);
        entityBaseService.transformObjectsToReferences(product, references);

        productModule.update(product)
            .then(function(product) {
                deferred.resolve(product);
            })
            .catch(function (err) {
                deferred.reject(err);
            })
            .finally(function(){
                entityBaseService.restoreReferences(product, savedObjects);
            });

        return deferred.promise;
    }

    function loadProduct(id) {
        var deferred = $q.defer();

        productModule.load(id)
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
    }
}
