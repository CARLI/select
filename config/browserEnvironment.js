module.exports = {
    request: require('browser-request'),
    middleware: require('../middleware/browserAdapter'),
    couchUtils: require('../middleware/browserAdapters/couchUtils'),
    crmQueries: require('../middleware/browserAdapters/crmQueries'),
    listProductsWithOfferingsForVendorId: require('../middleware/browserAdapters/listProductsWithOfferingsForVendorId'),
    notifications: require('../middleware/browserAdapters/notifications')
};
