angular.module('common.productService')
    .service('productService', productService);

function productService( CarliModules, $q, cycleService, errorHandler ) {

    var productModule = CarliModules.Product;
    var productMiddleware = CarliModules.ProductMiddleware;

    return {
        list:   function() {
            return $q.when( productModule.list( cycleService.getCurrentCycle() ) )
                .catch(errorHandler);
        },
        create: function( product ) {
            return $q.when( productModule.create(product, product.cycle) );
        },
        update: function( product ) {
            return $q.when( productModule.update(product, product.cycle) );
        },
        load:   function( productId ) {
            return $q.when( productModule.load( productId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listAvailableOneTimePurchaseProducts: function(){
            return $q.when( productModule.listAvailableOneTimePurchaseProducts.apply(this, arguments) )
                .catch(errorHandler);
        },
        listProductsForLicenseId: function( licenseId ){
            return $q.when( productModule.listProductsForLicenseId( licenseId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listProductsForVendorId: function( vendorId ) {
            return $q.when( productModule.listProductsForVendorId( vendorId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listActiveProductsForVendorId: function listActiveProductsForVendorId( vendorId ){
            return $q.when( productModule.listActiveProductsForVendorId(vendorId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listProductsWithOfferingsForVendorId: function (vendorId) {
            return $q.when( productMiddleware.listProductsWithOfferingsForVendorId( vendorId, cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        listProductCountsByVendorId: function(){
            return $q.when( productModule.listProductCountsByVendorId( cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        getProductsById: function(ids) {
            return $q.when( productModule.getProductsById(ids,  cycleService.getCurrentCycle()) )
                .catch(errorHandler);
        },
        getProductSelectionStatisticsForCycle: function( productId, cycle ){
            var cycleToUse = cycle || cycleService.getCurrentCycle();
            return $q.when( productModule.getProductSelectionStatisticsForCycle(productId, cycleToUse) );
        },
        isProductActive: productModule.isProductActive,
        getProductDetailCodeOptions: productModule.getProductDetailCodeOptions,
        getProductDisplayName: getProductDisplayName
    };

    function getProductDisplayName(product) {
        if (!product) {
            return '';
        }
        var name = product.name;
        if (product.showPreviousName) {
            name += ' (formerly ' + product.previousName + ')';
        }
        return name;
    }
}
