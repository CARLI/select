var middlewareRequest = require('./middlewareRequest');

function getCycleStatusForAllVendorsAllCycles(){
    var request = {
        path: '/cycle-database-status',
        method: 'get'
    };

    return middlewareRequest(request);
}

function getCycleStatusForAllVendors( cycleId ){
    var request = {
        path: '/cycle-database-status/' + cycleId,
        method: 'get'
    };

    return middlewareRequest(request);
}

function getCycleStatusForVendorId( vendorId, cycleId ){
    var request = {
        path: '/cycle-database-status/' + cycleId + '/for-vendor/' + vendorId,
        method: 'get'
    };

    return middlewareRequest(request);
}

module.exports = {
    getCycleStatusForAllVendorsAllCycles: getCycleStatusForAllVendorsAllCycles,
    getCycleStatusForAllVendors: getCycleStatusForAllVendors,
    getCycleStatusForVendorId: getCycleStatusForVendorId
};
