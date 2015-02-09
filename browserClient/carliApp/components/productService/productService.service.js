angular.module('carli.productService')
    .service('productService', productService);

function productService( CarliModules, $q, cycleService ) {

    var productModule = CarliModules.Product;

    return {
        list:   function() {
            return $q.when( productModule.list( cycleService.getCurrentCycle() ) );
        },
        create: function( product ) {
            return $q.when( productModule.create(product, cycleService.getCurrentCycle()) );
        },
        update: function( product ) {
            return $q.when( productModule.update(product, cycleService.getCurrentCycle()) );
        },
        load:   function( productId ) {
            return $q.when( productModule.load( productId, cycleService.getCurrentCycle()) );
        },
        listAvailableOneTimePurchaseProducts: function(){
            return $q.when( productModule.listAvailableOneTimePurchaseProducts.apply(this, arguments) );
        },
        listProductsForLicenseId: function( licenseId ){
            return $q.when( productModule.listProductsForLicenseId( licenseId, cycleService.getCurrentCycle()) );
        },
        listProductsForVendorId: function( vendorId ) {
            return $q.when( productModule.listProductsForVendorId( vendorId, cycleService.getCurrentCycle()) );
        },
        listProductCountsByVendorId: function(){
            return $q.when( productModule.listProductCountsByVendorId( cycleService.getCurrentCycle()) );
        },
        getProductDetailCodeOptions: productModule.getProductDetailCodeOptions
    };
}
