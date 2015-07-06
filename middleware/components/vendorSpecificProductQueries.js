var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var Q = require('q');

function listProductsWithOfferingsForVendorId(vendorId, cycleId) {
    return vendorRepository.load(vendorId).then(function(vendor) {
        var cycleRepository = cycleRepositoryForVendor(vendor);
        return cycleRepository.load(cycleId).then(loadProductsAndOfferings);
    });

    function loadProductsAndOfferings(cycle) {
        return productRepository.listActiveProductsForVendorId(vendorId, cycle).then(loadOfferingsForProducts);

        function loadOfferingsForProducts(products) {
            return Q.all( products.map(loadOfferingsForProduct));

            function loadOfferingsForProduct(product) {
                return offeringRepository.listOfferingsForProductIdUnexpanded(product.id, cycle).then(function(offerings) {
                    product.offerings = offerings;
                    return product;
                });
            }
        }
    }

}

function updateSuPricingForProduct( vendorId, productId, newSuPricing, cycleId ){
    var cycle = null;
    
    return vendorRepository.load(vendorId)
        .then(function(vendor) {
            var cycleRepository = cycleRepositoryForVendor(vendor);
            return cycleRepository.load(cycleId);
        }, catchNoVendor)
        .then(function(loadedCycle){
            cycle = loadedCycle;
            return offeringRepository.ensureProductHasOfferingsForAllLibraries(productId, vendorId, cycle);
        }, catchNoCycle)
        .then(function(){
            return offeringRepository.updateSuPricingForAllLibrariesForProduct(vendorId, productId, newSuPricing, cycle);
        },catchEnsureError)
        .catch(updateSuPricingError);

    function catchNoVendor( err ){
        console.log('error updating Su Pricing For Product '+ productId +' - No Vendor', err);
    }
    function catchNoCycle( err ){
        console.log('error updating Su Pricing For Product '+ productId +' - No Cycle', err);
    }
    function catchEnsureError( err ){
        console.log('error updating Su Pricing For Product '+ productId +' - Ensure Error', err);
    }
    function updateSuPricingError( err ){
        console.log('error updating Su Pricing For Product '+ productId +' - Updating Pricing ', err);
    }
}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId,
    updateSuPricingForProduct: updateSuPricingForProduct
};
