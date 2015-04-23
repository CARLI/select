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
        return productRepository.listProductsForVendorId(vendorId, cycle).then(loadOfferingsForProducts);

        function loadOfferingsForProducts(products) {
            return Q.all( products.map(loadOfferingsForProduct));

            function loadOfferingsForProduct(product) {
                return offeringRepository.listOfferingsForProductId(product.id, cycle).then(function(offerings) {
                    product.offerings = offerings;
                    return product;
                });
            }
        }
    }

}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId
};
