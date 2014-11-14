module.exports = {
    config: require( './config' ),
    Library: require('./Entity/LibraryRepository'),
    License: require('./Entity/LicenseRepository'),
    Product: require('./Entity/ProductRepository'),
    Vendor: require('./Entity/VendorRepository'),
    Store: require('./Store'),
    MemoryStore: require('./Store/MemoryStore'),
    FileStore: require('./Store/FileStore'),
    CouchDbStore: require('./Store/CouchDbStore'),
    Validator: require('./Validator')
};
