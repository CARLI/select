var middlewareRequest = require('./middlewareRequest');

function listProductsWithOfferingsForVendorId(vendorId, cycleId) {
    return middlewareRequest({
        path: '/products-with-offerings-for-vendor/' + vendorId + '/for-cycle/' + cycleId,
        method: 'get',
        json: true
    });
}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId
};
