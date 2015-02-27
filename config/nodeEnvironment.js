module.exports = {
    request: require('request'),
    middleware: require('../middleware'),
    couchUtils: require('../middleware/components/couchUtils'),
    crmQueries: require('../middleware/components/crmQueries'),
    listProductsWithOfferingsForVendorId: require('../middleware/components/listProductsWithOfferingsForVendorId'),
    notifications: require('../middleware/components/notifications')
};
