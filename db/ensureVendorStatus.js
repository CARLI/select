var Q = require('q');
var carli = require('../CARLI');
var config = carli.config;
var cycleRepository = carli.Cycle;
var vendorRepository = carli.Vendor;
var vendorStatusRepository = carli.VendorStatus;

//Do it on QA
//config.storeOptions.couchDbUrl = 'http://carli-db.qa.pixotech.com';

cycleRepository.listActiveCycles()
    .then(function(cycleList){
        Logger.log('Got '+cycleList.length+' cycles');
        return Q.all( cycleList.map(ensureAllVendorsHaveStatusForCycle)) ;
    })
    .done();

function ensureAllVendorsHaveStatusForCycle( cycle ){

    return vendorRepository.list()
        .then(function(vendorList){
            Logger.log('Ensure vendor status entries for '+cycle.name+' - '+vendorList.length+' vendors');
            return Q.all( vendorList.map(makeVendorStatus) );
        });

    function makeVendorStatus(vendor){
        Logger.log('  + '+vendor.name);
        return vendorStatusRepository.ensureStatusExistsForVendor(vendor.id, cycle)
            .catch(function(err){
                Logger.log('  error making status for '+vendor.name,err);
                throw err;
            });
    }
}
