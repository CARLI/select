angular.module('common.productService')
    .service('productService', productService);

function productService( CarliModules, $q, cycleService, libraryService, offeringService ) {

    var productModule = CarliModules.Product;
    var productMiddleware = CarliModules.ProductMiddleware;

    return {
        list:   function() {
            return $q.when( productModule.list( cycleService.getCurrentCycle() ) );
        },
        create: function( product ) {
            return $q.when( productModule.create(product, product.cycle) );
        },
        update: function( product ) {
            return $q.when( productModule.update(product, product.cycle) );
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
        listProductsWithOfferingsForVendorId: function (vendorId) {
            return $q.when( productMiddleware.listProductsWithOfferingsForVendorId( vendorId, cycleService.getCurrentCycle()) );
        },
        listProductCountsByVendorId: function(){
            return $q.when( productModule.listProductCountsByVendorId( cycleService.getCurrentCycle()) );
        },
        getProductsById: function(ids) {
            return $q.when( productModule.getProductsById(ids,  cycleService.getCurrentCycle()) );
        },
        createOfferingsForProduct: createOfferingsForProduct,
        getProductDetailCodeOptions: productModule.getProductDetailCodeOptions,
        getProductDisplayName: getProductDisplayName
    };


    function createOfferingsForProduct( productId ){
        return libraryService.listActiveLibraries()
            .then(getLibraryIds)
            .then(function( libraryIds ){
                return offeringService.createOfferingsFor( productId, libraryIds );
            });

        function getLibraryIds( listOfLibraries ){
            return listOfLibraries.map(function(library){
                return library.id;
            });
        }
    }

    function getProductDisplayName(product) {
        if (!product) {
            return '';
        }
        var name = product.name;
        if (product.showPreviousName) {
            name += ' (formerly ' + product.previousName + ')';
        };
        return name;
    }
}
