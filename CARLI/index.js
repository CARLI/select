module.exports = {
    Vendor: require('./Entity/VendorRepository'),
    Store: require('./Store'),
    MemoryStore: require('./Store/MemoryStore'),
    FileStore: require('./Store/FileStore')
};
