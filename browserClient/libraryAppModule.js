/* This file exists to tell Browserify what to package into the carliModules for the library app. */

module.exports = {
    ActivityLog: require('../CARLI/Entity/ActivityLogRepository'),
    Attachments: require('../CARLI/Attachments'),
    Auth: require('../CARLI/Auth'),
    AuthMiddleware: require('../middleware/browserAdapters/auth'),
    config: require( '../config' ),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    LibraryMiddleware: require('../middleware/browserAdapters/libraryQueries'),
    LibraryStatus: require('../CARLI/Entity/LibraryStatusRepository'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    Store: require('../CARLI/Store'),
    User: require('../CARLI/Entity/UserRepository'),
    UserMiddleware: require('../middleware/browserAdapters/user'),
    Validator: require('../CARLI/Validator')
};
