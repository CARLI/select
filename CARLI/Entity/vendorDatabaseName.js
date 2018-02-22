module.exports = function vendorDatabaseName(cycleDatabaseName, vendorId) {
    return cycleDatabaseName + '-' + vendorId;
};