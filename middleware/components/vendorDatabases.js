
var Q = require('q');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils');
var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');
var vendorRepository = require('../../CARLI/Entity/VendorRepository');

function getCycleStatusForAllVendorsAllCycles() {
    return cycleRepository.list().then(gatherStatuses);

    function gatherStatuses(cycles) {
        return Q.all(cycles.map(gatherStatusesForCycle))
            .then(flattenResultsArray);

        function gatherStatusesForCycle(cycle) {
            return getCycleStatusForAllVendors(cycle.id);
        }

        function flattenResultsArray(statuses) {
            var flattened = [];
            return flattened.concat.apply(flattened, statuses);
        }
    }
}

function getCycleStatusForAllVendors(cycleId) {
    return vendorRepository.list().then(gatherStatuses);

    function gatherStatuses(vendors) {
        return Q.all( vendors.map(gatherStatusForVendor) );

        function gatherStatusForVendor(vendor) {
            return getDatabaseStatusForVendor(vendor, cycleId);
        }
    }
}

function getCycleStatusForVendorId(vendorId, cycleId) {
    return vendorRepository.load(vendorId).then(function (vendor) {
        return getDatabaseStatusForVendor(vendor, cycleId);
    });
}

function getDatabaseStatusForVendor(vendor, cycleId) {
    var status = {
        vendorId: vendor.id,
        cycleId: cycleId,
        databaseExists: false,
        replicationProgress: 0,
        indexingProgress: 0,
        viewIndexDelta: 0
    };

    return loadCycleForVendor()
        .then(checkDatabaseExists)
        .then(returnCompleteStatusObject)
        .catch(returnStatusForNonexistentDatabase);

    function loadCycleForVendor() {
        return cycleRepositoryForVendor(vendor).load(cycleId);
    }

    function checkDatabaseExists(vendorCycle) {
        return couchUtils
            .doesDatabaseExist(vendorCycle.getDatabaseName())
            .then(returnCycleOrThrowIfNoDatabase);

        function returnCycleOrThrowIfNoDatabase(databaseExists) {
            if (databaseExists) {
                return vendorCycle;
            } else {
                throw new Error('No database for vendor');
            }
        }
    }

    function returnCompleteStatusObject(vendorCycle) {
        console.log('completing the status object');
        return addReplicationProgress(vendorCycle)
            .then(addIndexingProgress)
            .then(addViewIndexDelta);
    }

    function returnStatusForNonexistentDatabase() {
        return status;
    }

    function addReplicationProgress(vendorCycle) {
        return couchUtils.getCycleReplicationStatus(vendorCycle).then(function (progress) {
            status.replicationProgress = progress;
            return vendorCycle;
        });
    }
    function addIndexingProgress(vendorCycle) {
        return couchUtils.getCycleViewIndexingStatus(vendorCycle).then(function (progress) {
            status.indexingProgress = progress;
            return vendorCycle;
        });
    }

    function addViewIndexDelta(vendorCycle) {
        return Q.all([
            couchUtils.getDatabaseInfo(vendorCycle.getDatabaseName()),
            couchUtils.getDatabaseDesignDocInfo(vendorCycle.getDatabaseName())
        ]).then(function(info) {
            var vendorDatabaseInfo = info[0];
            var vendorDesignDocInfo =  info[1];
            status.viewIndexDelta = vendorDatabaseInfo.update_seq - vendorDesignDocInfo.view_index.update_seq;
            return vendorCycle;
        });
    }
}

module.exports = {
    getCycleStatusForAllVendorsAllCycles: getCycleStatusForAllVendorsAllCycles,
    getCycleStatusForAllVendors: getCycleStatusForAllVendors,
    getCycleStatusForVendorId: getCycleStatusForVendorId
};
