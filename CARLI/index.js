module.exports = {
    config: require( './config' ),
    Cycle: require('./Entity/CycleRepository'),
    Library: require('./Entity/LibraryRepository'),
    License: require('./Entity/LicenseRepository'),
    Product: require('./Entity/ProductRepository'),
    Vendor: require('./Entity/VendorRepository'),
    Store: require('./Store'),
    MemoryStore: require('./Store/MemoryStore'),
    FileStore: require('./Store/FileStore'),
    CouchDbStore: require('./Store/CouchDb/Store'),
    Validator: require('./Validator')
};
