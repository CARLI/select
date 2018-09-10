var carliError = require('../../CARLI/Error');
var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');
var request = require('../../config/environmentDependentModules/request');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var Q = require('q');

function listProductsWithOfferingsForVendorId(vendorId, cycleId) {
    request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

    return vendorRepository.load(vendorId).then(function(vendor) {
        var cycleRepository = cycleRepositoryForVendor(vendor);
        return cycleRepository.load(cycleId)
            .then(function(cycle) {
                return cycle;
            })
            .then(loadProductsAndOfferings);
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

function updateSuPricingForProduct( vendorId, productId, newSuPricing, vendorComments, cycleId ){

    console.log('updateSuPricingForProduct(', vendorId, productId, newSuPricing, vendorComments, cycleId );

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
            return offeringRepository.updateSuPricingForAllLibrariesForProduct(vendorId, productId, newSuPricing, vendorComments, cycle);
        },catchEnsureError)
        .catch(updateSuPricingError);

    function catchNoVendor( err ){
        Logger.log('error updating Su Pricing For Product '+ productId +' - No Vendor', err);
        throwUpdateError();
    }
    function catchNoCycle( err ){
        Logger.log('error updating Su Pricing For Product '+ productId +' - No Cycle', err);
        throwUpdateError();
    }
    function catchEnsureError( err ){
        Logger.log('error updating Su Pricing For Product '+ productId +' - Ensure Error', err);
        throwUpdateError();
    }
    function updateSuPricingError( err ){
        Logger.log('error updating Su Pricing For Product '+ productId +' - Updating Pricing ', err);
        throwUpdateError();
    }

    function throwUpdateError(){
        throw new Error('Error updating SU pricing');
    }
}

function updateSuCommentForProduct(vendorId, productId, numSu, newCommentText, cycleId) {
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
            return offeringRepository.updateSuCommentForAllLibrariesForProduct(vendorId, productId, numSu, newCommentText, cycle);
        },catchEnsureError)
        .catch(updateSuPricingError);

    function catchNoVendor( err ){
        Logger.log('error updating comments for product '+ productId +' - No Vendor', err);
        throwUpdateError();
    }
    function catchNoCycle( err ){
        Logger.log('error updating comments for product '+ productId +' - No Cycle', err);
        throwUpdateError();
    }
    function catchEnsureError( err ){
        Logger.log('error updating comments for product '+ productId +' - Ensure Error', err);
        throwUpdateError();
    }
    function updateSuPricingError( err ){
        Logger.log('error updating comments for product '+ productId +' - Updating Pricing ', err);
        throwUpdateError();
    }

    function throwUpdateError(){
        throw new Error('Error updating SU comments');
    }
}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId,
    updateSuPricingForProduct: updateSuPricingForProduct,
    updateSuCommentForProduct: updateSuCommentForProduct
};
