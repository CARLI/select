
var Q = require('q');
var carliConfig = require('../config');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../CARLI/Entity/CycleRepositoryForVendor');
var vendorRepository = require('../CARLI/Entity/VendorRepository');
var vendorStatusRepository = require('../CARLI/Entity/VendorStatusRepository');

function createVendorDatabases(cycleId) {

    return cycleRepository.load(cycleId)
        .then(function(cycle){
            if ( cycle.isArchived ){
                return Q();
            }
            else {
                return vendorRepository.list().then(function (vendors) {
                    console.log('Replicating ' + cycleId + ' for ' + vendors.length + ' vendors');
                    return Q.all( vendors.map(createDatabase) );

                    function createDatabase(vendor) {
                        var repoForVendor = cycleRepositoryForVendor(vendor);
                        return repoForVendor.createDatabase(cycleId)
                            .then(repoForVendor.load)
                            .then(function (cycleForVendor) {
                                return cycleForVendor.replicateFromSource();
                            });
                    }
                });
            }
        });
}

function createVendorStatusesForAllCycles(){
    cycleRepository.list()
        .then(function(cycleList){
            return Q.all( cycleList.map(ensureAllVendorsHaveStatusForCycle)) ;
        })
        .done();

    function ensureAllVendorsHaveStatusForCycle( cycle ){

        if ( cycle.isArchived || cycle.id === carliConfig.oneTimePurchaseProductsCycleDocId ){
            return Q();
        }
        else {
            return vendorRepository.list()
                .then(function(vendorList){
                    console.log('Ensure vendor status entries for '+cycle.name+' - '+vendorList.length+' vendors');
                    return Q.all( vendorList.map(makeVendorStatus) );
                });
        }

        function makeVendorStatus(vendor){
            var newStatus = {
                cycle: cycle.id,
                vendor: vendor.id,
                description: 'No Activity',
                isClosed: false,
                flaggedOfferingsCount: 0
            };

            return vendorStatusRepository.create(newStatus, cycle)
                .catch(function(err){
                    console.log('  error making status for '+vendor.name,err);
                    throw err;
                });
        }
    }
}

module.exports = {
    createVendorDatabases: createVendorDatabases,
    createVendorStatusesForAllCycles: createVendorStatusesForAllCycles
};
