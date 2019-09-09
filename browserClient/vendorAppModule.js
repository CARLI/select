/* This file exists to tell Browserify what to package into the carliModules for the vendor app. */

module.exports = {
    ActivityLog: require('../CARLI/Entity/ActivityLogRepository'),
    Auth: require('../CARLI/Auth'),
    AuthMiddleware: require('../middleware/browserAdapters/auth'),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    config: require('../middleware/browserAdapters/config'),
    Csv: require('../CARLI/Csv'),
    Cycle: require('../CARLI/Entity/CycleRepositoryForVendor'),
    EmailMiddleware: require('../middleware/browserAdapters/email'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    ProductMiddleware: require('../middleware/browserAdapters/vendorSpecificProductQueries'),
    Store: require('../CARLI/Store'),
    User: require('../CARLI/Entity/UserRepository'),
    UserMiddleware: require('../middleware/browserAdapters/user'),
    Validator: require('../CARLI/Validator'),
    Vendor: require('../CARLI/Entity/VendorRepository'),
    VendorDatabaseMiddleware: require('../middleware/browserAdapters/vendorDatabases.js'),
    VendorCSV: require('../CARLI/VendorCSV'),
    VendorStatus: require('../CARLI/Entity/VendorStatusRepository')
};
