module.exports = {
    Library: require('./Entity/LibraryRepository'),
    License: require('./Entity/LicenseRepository'),
    Vendor: require('./Entity/VendorRepository'),
    Store: require('./Store'),
    MemoryStore: require('./Store/MemoryStore'),
    FileStore: require('./Store/FileStore'),
    Validator: require('./Validator')
};
