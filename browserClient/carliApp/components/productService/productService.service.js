angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, entityBaseService, licenseService, vendorService ) {

    var productModule = CarliModules.Product;

    return {
        list:   function() { return $q.when( productModule.list() ); },
        create: function() { return $q.when( productModule.create.apply(this, arguments) ); },
        update: function() { return $q.when( productModule.update.apply(this, arguments) ); },
        load:   function() { return $q.when( productModule.load.apply(this, arguments) ); },
        listAvailableOneTimePurchaseProducts: function(){
            return $q.when( productModule.listAvailableOneTimePurchaseProducts.apply(this, arguments) );
        },
        listProductsForLicenseId: function(){
            return $q.when( productModule.listProductsForLicenseId.apply(this, arguments) );
        },
        getProductDetailCodeOptions: productModule.getProductDetailCodeOptions
    };
}
