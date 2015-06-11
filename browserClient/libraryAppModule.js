/* This file exists to tell Browserify what to package into the carliModules for the library app. */

module.exports = {
    config: require( '../config' ),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    LibraryMiddleware: require('../middleware/browserAdapters/libraryQueries'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    Store: require('../CARLI/Store'),
    Validator: require('../CARLI/Validator')
};
