/* This file exists to tell Browserify what to package into the carliModules for the CARLI staff app. */

module.exports = {
    config: require('../config'),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    CycleMiddleware: require('../middleware/browserAdapters/cycleCreation'),
    DatabaseStatusMiddleware: require('../middleware/browserAdapters/vendorDatabases'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    License: require('../CARLI/Entity/LicenseRepository'),
    Notification: require('../CARLI/Entity/NotificationRepository'),
    NotificationTemplate: require('../CARLI/Entity/NotificationTemplateRepository'),
    NotificationDraftGenerator: require('../CARLI/NotificationDraftGenerator'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    User: require('../CARLI/Entity/UserRepository'),
    Vendor: require('../CARLI/Entity/VendorRepository'),
    VendorStatus: require('../CARLI/Entity/VendorStatusRepository'),
    Store: require('../CARLI/Store'),
    MemoryStore: require('../CARLI/Store/MemoryStore'),
    FileStore: require('../CARLI/Store/FileStore'),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Validator: require('../CARLI/Validator'),
    VendorDatabaseMiddleware: require('../middleware/browserAdapters/vendorDatabases.js')
};
