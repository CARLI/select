var Q = require('q');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils')();
var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository');
var vendorStatusRepository = require('../../CARLI/Entity/VendorStatusRepository.js');

function createVendorDatabasesForActiveCyclesForSingleVendor(vendorId) {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all(cycles.map(createDatabases));

        function createDatabases(cycle) {
            return createOneVendorDatabaseForCycle(vendorId, cycle.id);
        }
    });
}

function createOneVendorDatabaseForCycle(vendorId, cycleId) {
    return vendorRepository.load(vendorId).then(function (vendor) {
        return createDatabase(vendor)
            .thenResolve(cycleId);

        function createDatabase(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.createDatabase(cycleId);
        }
    });
}

function createVendorDatabasesForActiveCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all(cycles.map(createDatabases));

        function createDatabases(cycle) {
            return createVendorDatabasesForCycle(cycle.id);
        }
    });
}

function createVendorDatabasesForCycle(cycleId) {
    return vendorRepository.list().then(function (vendors) {
        return Q.all(vendors.map(createDatabase))
            .thenResolve(cycleId);

        function createDatabase(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.createDatabase(cycleId);
        }
    });
}

function replicateDataToVendorsForAllCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all(cycles.map(replicateData));

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
        return Q.all(vendors.map(replicateDataToVendor));

        function replicateDataToVendor(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.load(cycleId)
                .then(function (cycleForVendor) {
                    return cycleForVendor.replicateFromSource();
                });
        }
    }
}

function replicateDataToOneVendorForCycle(vendorId, cycleId) {
    return vendorRepository.load(vendorId)
        .then(replicateDataToVendor)
        .thenResolve(cycleId);

    function replicateDataToVendor(vendor) {
        var repoForVendor = cycleRepositoryForVendor(vendor);
        return repoForVendor.load(cycleId)
            .then(function (cycleForVendor) {
                return cycleForVendor.replicateFromSource();
            });
    }
}

function replicateDataFromVendorsForAllCycles() {
    return cycleRepository.listActiveCycles().then(function (cycles) {
        return Q.all(cycles.map(replicateData));

        function replicateData(cycle) {
            return replicateDataFromVendorsForCycle(cycle.id);
        }
    });
}

function replicateDataFromVendorsForCycle(cycleId) {
    return vendorRepository.list().then(function (vendors) {
        return Q.all(vendors.map(replicateData));

        function replicateData(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.load(cycleId)
                .then(function (cycleForVendor) {
                    return cycleForVendor.replicateToSource();
                });
        }
    });
}

function replicateDataFromOneVendorForCycle(vendorId, cycleId) {
    return vendorRepository.load(vendorId)
        .then(replicateData);

    function replicateData(vendor) {
        var repoForVendor = cycleRepositoryForVendor(vendor);
        return repoForVendor.load(cycleId)
            .then(function (cycleForVendor) {
                return cycleForVendor.replicateToSource();
            });
    }
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
        .catch(function (err) {
            tap(' *ERROR*', err);
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
        return Q.all(cycles.map(triggerIndexing));

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
        return Q.all(vendors.map(gatherStatusForVendor));

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
        ]).then(function (info) {
            var vendorDatabaseInfo = info[0];
            var vendorDesignDocInfo = info[1];
            //Logger.log(vendorDatabaseInfo);
            status.viewIndexDelta = vendorDatabaseInfo.update_seq - vendorDesignDocInfo.view_index.update_seq;

        });
    }
}

function updateFlaggedOfferingsForVendor(vendorId, cycleId) {
    var cycle = null;

    return vendorRepository.load(vendorId)
        .then(loadCycleForVendor, catchNoVendor)
        .then(saveCycle, catchNoCycle)
        .then(offeringRepository.listOfferingsUnexpanded)
        .then(populateProductsForOfferings)
        .then(getFlaggedOfferings)
        .then(populateLibrariesForFlaggedOfferings)
        .then(filterOfferingsForActiveLibraries)
        .then(computeFlaggedOfferingReasons)
        .then(updateVendorStatusFlaggedOfferings)
        .catch(function (err) {
            Logger.log('error updating flagged offerings', err);
        });

    function loadCycleForVendor(vendor) {
        Logger.log('Updating flagged offerings for ' + vendor.name + ' for cycle ' + cycleId);

        var cycleRepository = cycleRepositoryForVendor(vendor);
        return cycleRepository.load(cycleId);
    }

    function catchNoVendor(err) {
        Logger.log('error updating Flagged Offerings for vendor' + vendorId + ' - No Vendor', err);
    }

    function saveCycle(vendorCycle) {
        cycle = vendorCycle;
        return cycle;
    }

    function catchNoCycle(err) {
        Logger.log('error updating Flagged Offerings for vendor' + vendorId + ' - No Cycle', err);
    }

    function getFlaggedOfferings(listOfAllUnexpandedOfferings) {
        Logger.log('  loaded ' + listOfAllUnexpandedOfferings.length + ' total offerings');
        return listOfAllUnexpandedOfferings.filter(flagged);

        function flagged(offering) {
            return offeringRepository.getFlaggedState(offering, cycle);
        }
    }

    function populateProductsForOfferings(offerings) {
        const vendorId = offerings[0].vendor;

        return productRepository.getPriceCapsForProducts(vendorId, cycle)
            .then(result => {
                return offerings.map(offering => {
                    offering.product = {priceCap: result[offering.productId]};
                    return offering;
                });
            });
    }

    function populateLibrariesForFlaggedOfferings(flaggedOfferings) {
        return getLibraryIds(flaggedOfferings)
            .then(loadLibrariesById)
            .then(mapLibrariesById)
            .then(replaceLibraryIdsWithLibraryObject);

        function getLibraryIds(listOfOfferings) {
            return Q(listOfOfferings.map(getLibraryIdFromUnexpandedOffering));
        }

        function loadLibrariesById(libraryIds) {
            return libraryRepository.getLibrariesById(libraryIds);
        }

        function mapLibrariesById(listOfLibraries) {
            var results = {};

            listOfLibraries.forEach(function (library) {
                results[library.id] = library;
            });

            return results;
        }

        function replaceLibraryIdsWithLibraryObject(libraryMap) {
            return flaggedOfferings.map(replaceOfferingLibrary);

            function replaceOfferingLibrary(offering) {
                var libraryId = getLibraryIdFromUnexpandedOffering(offering);
                offering.library = libraryMap[libraryId];
                return offering;
            }
        }
    }


    function getLibraryIdFromUnexpandedOffering(offering) {
        return offering.library;
    }

    function filterOfferingsForActiveLibraries(flaggedOfferings) {
        Logger.log('  keeping ' + flaggedOfferings.length + ' flagged offerings');

        return flaggedOfferings.filter(offeringIsForActiveLibrary);

        function offeringIsForActiveLibrary(offering) {
            return offering.library && offering.library.isActive;
        }
    }

    function computeFlaggedOfferingReasons(flaggedOfferings) {
        Logger.log('  keeping ' + flaggedOfferings.length + ' flagged offerings for active libraries');

        var flaggedOfferingsCount = 0;
        var flaggedOfferingsReasonSummary = {};
        var flaggedOfferingsReasonProductDetails = {};

        flaggedOfferings.forEach(function (offering) {
            var productName = offering.product.name || '';
            flaggedOfferingsCount++;
            offering.flaggedReason.forEach(function (reason) {
                flaggedOfferingsReasonSummary[reason] = flaggedOfferingsReasonSummary[reason] || 0;
                flaggedOfferingsReasonSummary[reason]++;

                flaggedOfferingsReasonProductDetails[reason] = flaggedOfferingsReasonProductDetails[reason] || {};
                flaggedOfferingsReasonProductDetails[reason][productName] = (flaggedOfferingsReasonProductDetails[reason][productName] || 0) + 1;
            });

            //Logger.log('    flagged ' + productName + ' - ' + offering.library.name + ': ', offering.flaggedReason);
        });

        return {
            flaggedOfferingsCount: flaggedOfferings.length,
            flaggedOfferingsReasonSummary: flaggedOfferingsReasonSummary,
            flaggedOfferingsReasonProductDetails: flaggedOfferingsReasonProductDetails
        };
    }

    function updateVendorStatusFlaggedOfferings(flaggedReasons) {
        return vendorStatusRepository.getStatusForVendor(vendorId, cycle)
            .then(function (vendorStatus) {
                vendorStatus.flaggedOfferingsCount = flaggedReasons.flaggedOfferingsCount;
                vendorStatus.flaggedOfferingsReasons = {
                    summary: flaggedReasons.flaggedOfferingsReasonSummary,
                    details: flaggedReasons.flaggedOfferingsReasonProductDetails
                };
                return vendorStatusRepository.createOrUpdate(vendorStatus, cycle);
            });
    }
}

module.exports = {
    createVendorDatabasesForActiveCyclesForSingleVendor: createVendorDatabasesForActiveCyclesForSingleVendor,
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
