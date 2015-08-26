var middlewareRequest = require('./middlewareRequest')

function createVendorDatabasesForActiveCycles() {
    return middlewareRequest({
        path: '/create-all-vendor-databases',
        method: 'post'
    });
}

function createVendorDatabasesForCycle(cycleId) {
    return middlewareRequest({
        path: '/create-vendor-databases-for-cycle/' + cycleId,
        method: 'post'
    });
}

function replicateDataToVendorsForAllCycles() {
    return middlewareRequest({
        path: '/replicate-all-data-to-vendors',
        method: 'post'
    });
}

function replicateDataToVendorsForCycle(cycleId) {
    return middlewareRequest({
        path: '/replicate-data-to-vendors-for-cycle/' + cycleId,
        method: 'post'
    });
}

function replicateDataToOneVendorForCycle(vendorId,cycleId) {
    return middlewareRequest({
        path: '/replicate-data-to-one-vendor-for-cycle/' + vendorId + '/' + cycleId,
        method: 'post'
    });
}

function replicateDataFromVendorsForAllCycles() {
    return middlewareRequest({
        path: '/replicate-all-data-from-vendors',
        method: 'post'
    });
}

function replicateDataFromVendorsForCycle(cycleId) {
    return middlewareRequest({
        path: '/replicate-data-from-vendors-for-cycle/' + cycleId,
        method: 'post'
    });
}

function syncEverything() {
    return middlewareRequest({
        path: '/sync',
        method: 'get'
    });
}

function triggerIndexingForAllCycles() {
    return middlewareRequest({
        path: '/index-all-cycles',
        method: 'get'
    });
}
function triggerIndexingForCycleId(cycleId) {
    return middlewareRequest({
        path: '/index-cycle/' + cycleId,
        method: 'get'
    });
}

function getCycleStatusForAllVendorsAllCycles(){
    return middlewareRequest({
        path: '/cycle-database-status',
        method: 'get'
    });
}

function getCycleStatusForAllVendors( cycleId ){
    return middlewareRequest({
        path: '/cycle-database-status/' + cycleId,
        method: 'get'
    });
}

function getCycleStatusForVendorId( vendorId, cycleId ){
    return middlewareRequest({
        path: '/cycle-database-status/' + cycleId + '/for-vendor/' + vendorId,
        method: 'get'
    });
}

function updateFlaggedOfferingsForVendor(vendorId, cycle){
    return middlewareRequest({
        path: '/update-flagged-offerings-for-vendor/' + vendorId + '/for-cycle/' + cycle.id,
        method: 'post'
    });
}

module.exports = {
    createVendorDatabasesForActiveCycles: createVendorDatabasesForActiveCycles,
    createVendorDatabasesForCycle: createVendorDatabasesForCycle,
    replicateDataToVendorsForAllCycles: replicateDataToVendorsForAllCycles,
    replicateDataToVendorsForCycle: replicateDataToVendorsForCycle,
    replicateDataToOneVendorForCycle: replicateDataToOneVendorForCycle,
    replicateDataFromVendorsForAllCycles: replicateDataFromVendorsForAllCycles,
    replicateDataFromVendorsForCycle: replicateDataFromVendorsForCycle,
    syncEverything: syncEverything,
    triggerIndexingForAllCycles: triggerIndexingForAllCycles,
    triggerIndexingForCycleId: triggerIndexingForCycleId,
    getCycleStatusForAllVendorsAllCycles: getCycleStatusForAllVendorsAllCycles,
    getCycleStatusForAllVendors: getCycleStatusForAllVendors,
    getCycleStatusForVendorId: getCycleStatusForVendorId,
    updateFlaggedOfferingsForVendor: updateFlaggedOfferingsForVendor
};
