var Q = require('q');
var carli = require('../CARLI');

var vendorRepository = carli.Vendor;
var vendorStatusRepository = carli.VendorStatus;
var cycleRepository = carli.Cycle;

//cycleRepository.listActiveCycles()
//    .then(function(cycleList){
//        console.log('Got '+cycleList.length+' cycles');
//        return Q.all( cycleList.map(ensureAllVendorsHaveStatusForCycle)) ;
//    });

//fiscal-year-2014
cycleRepository.load('162cc8e8-d1ae-451a-975c-bc1fa6708749')
    .then(ensureAllVendorsHaveStatusForCycle);

//fiscal-year-2014-Cindy
//cycleRepository.load('2900023a501cc77df3d0f142d0000f7b')
//    .then(ensureAllVendorsHaveStatusForCycle);




function ensureAllVendorsHaveStatusForCycle( cycle ){
    return vendorRepository.list()
        .then(function(vendorList){
            console.log('Ensure vendor status entries for '+cycle.name);
            return Q.all( vendorList.map(makeVendorStatus) );
        });

    function makeVendorStatus(vendor){
        console.log('++'+vendor.name);
        return vendorStatusRepository.ensureStatusExistsForVendor(vendor.id, cycle);
    }
}
