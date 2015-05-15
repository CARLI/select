/* This file exists to tell Browserify what to package into the carliModules for the library app. */

module.exports = {
    config: require( '../config' ),
    Cycle: require('../CARLI/Entity/CycleRepository'),
    Library: require('../CARLI/Entity/LibraryRepository'),
    Offering: require('../CARLI/Entity/OfferingRepository'),
    Product: require('../CARLI/Entity/ProductRepository'),
    Store: require('../CARLI/Store'),
    CouchDbStore: require('../CARLI/Store/CouchDb/Store'),
    Validator: require('../CARLI/Validator')
};
