module.exports = {
    Library: require('./Entity/LibraryRepository'),
    Vendor: require('./Entity/VendorRepository'),
    Store: require('./Store'),
    MemoryStore: require('./Store/MemoryStore'),
    FileStore: require('./Store/FileStore')
};
