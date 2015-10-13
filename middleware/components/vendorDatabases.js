
var Q = require('q');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils')();
var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository');
var vendorStatusRepository = require('../../CARLI/Entity/VendorStatusRepository.js');

function createVendorDatabasesForActiveCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all( cycles.map(createDatabases) );

        function createDatabases(cycle) {
            return createVendorDatabasesForCycle(cycle.id);
        }
    });
}

function createVendorDatabasesForCycle(cycleId) {
    return vendorRepository.list().then(function (vendors) {
        return Q.all( vendors.map(createDatabase) )
            .thenResolve(cycleId);

        function createDatabase(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.createDatabase(cycleId);
        }
    });
}

function replicateDataToVendorsForAllCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all( cycles.map(replicateData) );

        function replicateData(cycle) {
            return replicateDataToVendorsForCycle(cycle.id);
        }
    });
}

function replicateDataToVendorsForCycle(cycleId) {
    return vendorRepository.list()
        .then(replicateDataToVendors)
        .thenResolve(cycleId);

    function replicateDataToVendors(vendors) {
        return Q.all( vendors.map(replicateDataToVendor) );

        function replicateDataToVendor(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.load(cycleId)
                .then(function (cycleForVendor) {
                    return cycleForVendor.replicateFromSource();
                });
        }
    }
}

function replicateDataToOneVendorForCycle(vendorId, cycleId){
    return vendorRepository.load(vendorId)
        .then(replicateDataToVendor)
        .thenResolve(cycleId);

    function replicateDataToVendor(vendor){
        var repoForVendor = cycleRepositoryForVendor(vendor);
        return repoForVendor.load(cycleId)
            .then(function (cycleForVendor) {
                return cycleForVendor.replicateFromSource();
            });
    }
}

function replicateDataFromVendorsForAllCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all( cycles.map(replicateData) );

        function replicateData(cycle) {
            console.log('3');
            return replicateDataFromVendorsForCycle(cycle.id);
        }
    });
}

function replicateDataFromVendorsForCycle(cycleId) {
    return vendorRepository.list().then(function (vendors) {
        return Q.all( vendors.map(replicateData) );

        function replicateData(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.load(cycleId)
                .then(function (cycleForVendor) {
                    Logger.debug('Replicating ' + cycleForVendor.name + ' for ' + vendor.name);
                    return cycleForVendor.replicateToSource();
                });
        }
    });
}

function replicateDataFromOneVendorForCycle(vendorId, cycleId) {
    // TODO
    return replicateDataFromVendorsForCycle(cycleId);
}

function syncEverything() {
    tap("Creating vendor databases (if needed)")();
    return createVendorDatabasesForActiveCycles()
        .then(tap('Replicating data to vendors'))
        .then(replicateDataToVendorsForAllCycles)
        .then(tap('Replicating data from vendors'))
        .then(replicateDataFromVendorsForAllCycles)
        .then(tap('Trigging indexing of views'))
        .then(triggerIndexingForAllCycles)
        .catch(function(err) {
            tap(' *ERROR*',err);
        });

    function tap(message) {
        return function (a) {
            Logger.log("[SYNC] " + message);
            return a;
        }
    }
}

function triggerIndexingForAllCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all( cycles.map(triggerIndexing) );

        function triggerIndexing(cycle) {
            return triggerIndexingForCycle(cycle);
        }
    });
}

function triggerIndexingForCycleId(cycleId) {
    return cycleRepository.load(cycleId).then(triggerIndexingForCycle);
}

function triggerIndexingForCycle(cycle) {

    return triggerIndexingForMainDatabase()
        .then(vendorRepository.list)
        .then(makeCycleInstancesForAllVendors)
        .then(triggerIndexingForAllVendorDatabases);

    function triggerIndexingForMainDatabase() {
        return couchUtils.triggerViewIndexing(cycle.getDatabaseName());
    }
    function makeCycleInstancesForAllVendors(vendors) {
        return Q.all(vendors.map(makeCycleInstanceForVendor));
    }
    function makeCycleInstanceForVendor(vendor) {
        return cycleRepositoryForVendor(vendor).load(cycle.id);
    }
    function triggerIndexingForAllVendorDatabases(cycles) {
        return Q.all(cycles.map(triggerIndexingForVendorDatabase));
    }
    function triggerIndexingForVendorDatabase(cycleForVendor) {
        return couchUtils.triggerViewIndexing(cycleForVendor.getDatabaseName());
    }
}

function getCycleStatusForAllVendorsAllCycles() {
    return cycleRepository.listActiveCycles().then(gatherStatuses);

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
        replicationDelta: 0,
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
        status.databaseExists = true;
        return addReplicationProgress(vendorCycle)
            .then(addIndexingProgress)
            .then(addDeltas)
            .thenResolve(status);
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

    function addDeltas(vendorCycle) {
        return Q.all([
            couchUtils.getDatabaseInfo(vendorCycle.getDatabaseName()),
            couchUtils.getDatabaseDesignDocInfo(vendorCycle.getDatabaseName())
        ]).then(function(info) {
            var vendorDatabaseInfo = info[0];
            var vendorDesignDocInfo =  info[1];
            //Logger.log(vendorDatabaseInfo);
            status.viewIndexDelta = vendorDatabaseInfo.update_seq - vendorDesignDocInfo.view_index.update_seq;

            //return couchUtils.getVendorDatabaseReplicationStatus(vendorCycle.getSourceDatabaseName(), vendorDatabaseInfo.update_seq, vendor.id)
            //    .then(function(response) {
            //        status.replicationDelta = response.results.length;
            //        return vendorCycle;
            //    });
        });
    }
}

function updateFlaggedOfferingsForVendor( vendorId, cycleId ){
    var cycle = null;
    var flaggedOfferingsCount = 0;
    var flaggedOfferingsReason = {};

    return vendorRepository.load(vendorId)
        .then(loadCycleForVendor, catchNoVendor)
        .then(function(vendorCycle){
            cycle = vendorCycle;
            return offeringRepository.listOfferingsUnexpanded(cycle);
        }, catchNoCycle)
        .then(function(offeringsList){
            offeringsList.forEach(function(offering){
                if ( offeringRepository.getFlaggedState(offering, cycle) ){
                    flaggedOfferingsCount++;
                    offering.flaggedReason.forEach(function(reason){
                        flaggedOfferingsReason[reason] = (flaggedOfferingsReason[reason] || 0) + 1;
                    });
                }
            });
        })
        .then(updateVendorStatusFlaggedOfferings)
        .catch(function(err){
            Logger.log('error updating flagged offerings', err);
        });

    function loadCycleForVendor(vendor){
        var cycleRepository = cycleRepositoryForVendor(vendor);
        return cycleRepository.load(cycleId);
    }

    function catchNoVendor( err ){
        Logger.log('error updating Flagged Offerings for vendor' + vendorId +' - No Vendor', err);
    }

    function catchNoCycle( err ){
        Logger.log('error updating Flagged Offerings for vendor' + vendorId +' - No Cycle', err);
    }

    function updateVendorStatusFlaggedOfferings(){
        return vendorStatusRepository.getStatusForVendor(vendorId, cycle)
            .then(function(vendorStatus){
                vendorStatus.flaggedOfferingsCount = flaggedOfferingsCount;
                vendorStatus.flaggedOfferingsReasons = flaggedOfferingsReason;
                return vendorStatusRepository.createOrUpdate(vendorStatus, cycle);
            });
    }
}

module.exports = {
    createVendorDatabasesForActiveCycles: createVendorDatabasesForActiveCycles,
    createVendorDatabasesForCycle: createVendorDatabasesForCycle,
    replicateDataToVendorsForAllCycles: replicateDataToVendorsForAllCycles,
    replicateDataToVendorsForCycle: replicateDataToVendorsForCycle,
    replicateDataToOneVendorForCycle: replicateDataToOneVendorForCycle,
    replicateDataFromVendorsForAllCycles: replicateDataFromVendorsForAllCycles,
    replicateDataFromVendorsForCycle: replicateDataFromVendorsForCycle,
    replicateDataFromOneVendorForCycle: replicateDataFromOneVendorForCycle,
    syncEverything: syncEverything,
    triggerIndexingForAllCycles: triggerIndexingForAllCycles,
    triggerIndexingForCycleId: triggerIndexingForCycleId,
    getCycleStatusForAllVendorsAllCycles: getCycleStatusForAllVendorsAllCycles,
    getCycleStatusForAllVendors: getCycleStatusForAllVendors,
    getCycleStatusForVendorId: getCycleStatusForVendorId,
    updateFlaggedOfferingsForVendor: updateFlaggedOfferingsForVendor
};
