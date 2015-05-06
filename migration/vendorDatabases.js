
var Q = require('q');

var cycleRepositoryForVendor = require('../CARLI/Entity/CycleRepositoryForVendor');
var vendorRepository = require('../CARLI/Entity/VendorRepository');

function createVendorDatabases(cycleId) {

    return vendorRepository.list().then(function (vendors) {
        console.log('Replicating ' + cycleId + ' for ' + vendors.length + ' vendors');
        return Q.all( vendors.map(createDatabase) );

        function createDatabase(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.createDatabase(cycleId);
        }
    });
}

module.exports = {
    createVendorDatabases: createVendorDatabases
};
