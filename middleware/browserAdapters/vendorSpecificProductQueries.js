var middlewareRequest = require('./middlewareRequest');

function listProductsWithOfferingsForVendorId(vendorId, cycle) {
    return middlewareRequest({
        path: '/products-with-offerings-for-vendor/' + vendorId + '/for-cycle/' + cycle.id,
        method: 'get',
        json: true
    });
}

function updateSuPricingForProduct(productId, newSuPricing, cycle){
    return middlewareRequest({
        path: '/update-su-pricing-for-product/' + cycle.id + '/' + productId,
        method: 'post',
        json: true,
        body: {
            newSuPricing: newSuPricing
        }
    });
}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId,
    updateSuPricingForProduct: updateSuPricingForProduct
};
