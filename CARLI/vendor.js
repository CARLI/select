module.exports = {
    config: require( '../config' ),
    Cycle: require('./Entity/CycleRepositoryForVendor'),
    Library: require('./Entity/LibraryRepository'),
    Offering: require('./Entity/OfferingRepository'),
    Product: require('./Entity/ProductRepository'),
    Store: require('./Store'),
    CouchDbStore: require('./Store/CouchDb/Store'),
    Validator: require('./Validator'),
    /*XXX*/Vendor: require('./Entity/VendorRepository')
};
