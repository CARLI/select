var middlewareRequest = require('./middlewareRequest');

function listProductsWithOfferingsForVendorId(vendorId, cycle) {
    return middlewareRequest({
        path: '/products-with-offerings-for-vendor/' + vendorId + '/for-cycle/' + cycle.id,
        method: 'get',
        json: true
    });
}

function updateSuPricingForProduct(vendorId, productId, newSuPricing, vendorComments, cycle){
    return middlewareRequest({
        path: '/update-su-pricing-for-product/' + vendorId + '/' + cycle.id + '/' + productId,
        method: 'post',
        json: true,
        body: {
            newSuPricing: newSuPricing,
            vendorComments: vendorComments
        }
    });
}

function updateSuCommentForProduct(vendorId, productId, numSu, newCommentText, cycle) {
    return middlewareRequest({
        path: '/update-su-comment-for-product/' + vendorId + '/' + cycle.id + '/' + productId,
        method: 'post',
        json: true,
        body: {
            users: numSu,
            comment: newCommentText
        }
    });
}

function updateSiteLicensePricingForProducts(vendorId, cycle, listOfVendorSiteLicensePrices) {
    return middlewareRequest({
        path: '/update-site-license-prices/' + vendorId + '/' + cycle.id,
        method: 'post',
        json: true,
        body: listOfVendorSiteLicensePrices
    });
}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId,
    updateSuPricingForProduct: updateSuPricingForProduct,
    updateSuCommentForProduct: updateSuCommentForProduct,
    updateSiteLicensePricingForProducts: updateSiteLicensePricingForProducts
};
