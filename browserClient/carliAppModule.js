/* This file exists to tell Browserify what to package into the carliModules for the CARLI staff app. */

module.exports = {
    Auth: require('../CARLI/Auth'),
    AuthMiddleware: require('../middleware/browserAdapters/auth'),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    config: require('../config'),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    CycleMiddleware: require('../middleware/browserAdapters/cycleCreation'),
    DatabaseStatusMiddleware: require('../middleware/browserAdapters/vendorDatabases'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    LibraryStatus: require('../CARLI/Entity/LibraryStatusRepository'),
    License: require('../CARLI/Entity/LicenseRepository'),
    MemoryStore: require('../CARLI/Store/MemoryStore'),
    Notification: require('../CARLI/Entity/NotificationRepository'),
    NotificationDraftGenerator: require('../CARLI/NotificationDraftGenerator'),
    NotificationTemplate: require('../CARLI/Entity/NotificationTemplateRepository'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    Store: require('../CARLI/Store'),
    User: require('../CARLI/Entity/UserRepository'),
    UserMiddleware: require('../middleware/browserAdapters/user'),
    Validator: require('../CARLI/Validator'),
    Vendor: require('../CARLI/Entity/VendorRepository'),
    VendorDatabaseMiddleware: require('../middleware/browserAdapters/vendorDatabases.js'),
    VendorStatus: require('../CARLI/Entity/VendorStatusRepository')
};
