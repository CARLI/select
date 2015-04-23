var middlewareRequest = require('./middlewareRequest');

function listProductsWithOfferingsForVendorId(vendorId, cycle) {
    return middlewareRequest({
        path: '/products-with-offerings-for-vendor/' + vendorId + '/for-cycle/' + cycle.id,
        method: 'get',
        json: true
    });
}

module.exports = {
    listProductsWithOfferingsForVendorId: listProductsWithOfferingsForVendorId
};
