/* This file exists to tell Browserify what to package into the carliModules for the CARLI staff app. */

module.exports = {
    config: require('../config'),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    CycleMiddleware: require('../middleware/browserAdapters/cycleCreation'),
    DatabaseStatusMiddleware: require('../middleware/browserAdapters/vendorDatabases'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    License: require('../CARLI/Entity/LicenseRepository'),
    MemoryStore: require('../CARLI/Store/MemoryStore'),
    Notification: require('../CARLI/Entity/NotificationRepository'),
    NotificationTemplate: require('../CARLI/Entity/NotificationTemplateRepository'),
    NotificationDraftGenerator: require('../CARLI/NotificationDraftGenerator'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    Store: require('../CARLI/Store'),
    Validator: require('../CARLI/Validator'),
    Vendor: require('../CARLI/Entity/VendorRepository'),
    VendorDatabaseMiddleware: require('../middleware/browserAdapters/vendorDatabases.js'),
    VendorStatus: require('../CARLI/Entity/VendorStatusRepository')
};
