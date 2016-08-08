/* This file exists to tell Browserify what to package into the carliModules for the library app. */

module.exports = {
    ActivityLog: require('../CARLI/Entity/ActivityLogRepository'),
    Attachments: require('../CARLI/Attachments'),
    Auth: require('../CARLI/Auth'),
    AuthMiddleware: require('../middleware/browserAdapters/auth'),
    config: require( '../config' ),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Csv: require('../CARLI/Csv'),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    EmailMiddleware: require('../middleware/browserAdapters/email'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    LibraryMiddleware: require('../middleware/browserAdapters/libraryQueries'),
    LibraryStatus: require('../CARLI/Entity/LibraryStatusRepository'),
    Membership: require('../CARLI/Entity/MembershipRepository'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    ReportsData: require('../middleware/browserAdapters/reports'),
    Store: require('../CARLI/Store'),
    User: require('../CARLI/Entity/UserRepository'),
    UserMiddleware: require('../middleware/browserAdapters/user'),
    Validator: require('../CARLI/Validator')
};
