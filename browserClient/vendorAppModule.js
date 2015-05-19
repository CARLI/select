/* This file exists to tell Browserify what to package into the carliModules for the vendor app. */

module.exports = {
    config: require( '../config' ),
    Csv: require('../CARLI/Csv'),
    Cycle: require('../CARLI/Entity/CycleRepositoryForVendor'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    ProductMiddleware: require('../middleware/browserAdapters/vendorSpecificProductQueries'),
    Store: require('../CARLI/Store'),
    User: require('../CARLI/Entity/UserRepository'),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Validator: require('../CARLI/Validator'),
    /*XXX*/Vendor: require('../CARLI/Entity/VendorRepository'),
    VendorDatabaseMiddleware: require('../middleware/browserAdapters/vendorDatabases.js'),
    VendorStatus: require('../CARLI/Entity/VendorStatusRepository')
};
