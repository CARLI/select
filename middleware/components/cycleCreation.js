var Q = require('q');
var _ = require('lodash');
var config = require( '../../config' );
var CouchUtils = require('../../CARLI/Store/CouchDb/Utils');
var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository');
var libraryStatusRepository = require('../../CARLI/Entity/LibraryStatusRepository');
var licenseRepository = require('../../CARLI/Entity/LicenseRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository');
var productRepository = require('../../CARLI/Entity/ProductRepository');
var request = require('../../config/environmentDependentModules/request');
var Store = require( '../../CARLI/Store' );
var StoreModule = require( '../../CARLI/Store/CouchDb/Store');
var vendorDatabases = require('./vendorDatabases');
var vendorRepository = require('../../CARLI/Entity/VendorRepository');
var vendorStatusRepository = require('../../CARLI/Entity/VendorStatusRepository');

var couchUtils = null;
var StoreOptions = config.storeOptions;

useAdminCouchCredentials();

function useAdminCouchCredentials() {
    var adminStoreOptions = _.clone(StoreOptions);
    adminStoreOptions.couchDbUrl = StoreOptions.privilegedCouchDbUrl;

    //config.setStoreOptionsForCycles(adminStoreOptions);
    couchUtils = CouchUtils(adminStoreOptions);
    cycleRepository.setStore(Store(StoreModule(adminStoreOptions)));
    libraryRepository.setStore(Store(StoreModule(adminStoreOptions)));
    libraryStatusRepository.setStore(Store(StoreModule(adminStoreOptions)));
    licenseRepository.setStore(Store(StoreModule(adminStoreOptions)));
    offeringRepository.setStore(Store(StoreModule(adminStoreOptions)));
    productRepository.setStore(Store(StoreModule(adminStoreOptions)));
    vendorRepository.setStore(Store(StoreModule(adminStoreOptions)));
    vendorStatusRepository.setStore(Store(StoreModule(adminStoreOptions)));
}

function create( newCycleData ) {
    return cycleRepository.create(newCycleData, couchUtils.DB_TYPE_STAFF | couchUtils.DB_TYPE_LIBRARY)
        .then(vendorDatabases.createVendorDatabasesForCycle);
}

function copyCycleDataFrom( sourceCycleId, newCycleId ){
    var sourceCycle = null;
    var newCycle = null;

    request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

    return loadCycles()
        .then(replicate)
        .then(indexViews)
        .then(waitForIndexingToFinish)
        .then(resetVendorStatuses)
        .then(resetLibraryStatuses)
        .then(transformProducts)
        .then(transformOfferings)
        .then(indexViews)
        .then(waitForIndexingToFinish)
        .then(setCycleToNextPhase)
        .thenResolve(newCycleId)
        .catch((err) => {
            Logger.log(err);
            throw err;
        });

    function loadCycles() {
        return Q.all([
            cycleRepository.load(sourceCycleId),
            cycleRepository.load(newCycleId)
        ]).then(function (cycles) {
            sourceCycle = cycles[0];
            newCycle = cycles[1];
            return true;
        });
    }
    function replicate() {
        cycleRepository.createCycleLog('Replicating data from '+ sourceCycle.databaseName +' to '+ newCycle.databaseName);
        return couchUtils.replicateFrom(sourceCycle.databaseName).to(newCycle.databaseName)
    }
    async function resetVendorStatuses() {
        cycleRepository.createCycleLog('Resetting vendor statuses for ' + newCycle.databaseName);

        return vendorRepository.list()
            .then(function(vendorList){
                return Q.all( vendorList.map(ensureVendorStatus))
                    .then(function(){
                        return Q.all( vendorList.map(resetVendorStatus) );
                    });
            });

        function ensureVendorStatus(vendor){
            return vendorStatusRepository.ensureStatusExistsForVendor(vendor.id, newCycle);
        }
        function resetVendorStatus(vendor){
            return vendorStatusRepository.getStatusForVendor(vendor.id, newCycle)
                .then(function(vendorStatus){
                    var resetStatus = vendorStatusRepository.reset(vendorStatus, newCycle);
                    resetStatus.cycle = newCycle.id;
                    return vendorStatusRepository.update(resetStatus, newCycle);
                });
        }
    }

    function resetLibraryStatuses() {
        cycleRepository.createCycleLog('Ensuring all libraries have statuses for ' + newCycle.databaseName);

        return ensureLibraryStatuses()
            .then(function () {
                return libraryStatusRepository.list(newCycle)
                    .then(function (libraryStatusList) {
                        cycleRepository.createCycleLog('Resetting all library statuses for ' + newCycle.databaseName);
                        return Q.all(libraryStatusList.map(resetLibraryStatus));
                    });
            });

        function ensureLibraryStatuses() {
            return libraryRepository.list()
                .then(function(libraries) {
                    return Q.all( libraries.map(ensureStatusExistsForLibrary) );
                });

            function ensureStatusExistsForLibrary(library) {
                return libraryStatusRepository.ensureLibraryStatus(library.id, newCycle);
            }
        }

        function resetLibraryStatus(status) {
            var resetStatus = libraryStatusRepository.reset(status);
            resetStatus.cycle = newCycle.id;
            return libraryStatusRepository.update(resetStatus, newCycle);
        }
    }

    function transformProducts() {
        cycleRepository.createCycleLog('Transforming products for new cycle');
        return productRepository.transformProductsForNewCycle(newCycle);
    }
    function transformOfferings() {
        cycleRepository.createCycleLog('Transforming offerings for new cycle');
        return offeringRepository.transformOfferingsForNewCycle(newCycle, sourceCycle);
    }
    function indexViews() {
        cycleRepository.createCycleLog('Triggering view indexing for ' + newCycle.name + ' with database ' + newCycle.getDatabaseName());
        return couchUtils.triggerViewIndexing(newCycle.getDatabaseName());
    }
    function waitForIndexingToFinish() {
        var waitForIndex = Q.defer();

        var trustViewIndex = false;
        var intervalId = setInterval(checkIndexStatus, 1000);

        function checkIndexStatus() {
            getViewIndexingStatus(newCycle).then(function (progress) {
                /**
                 * We don't initially trust a value of 100 because that could mean the indexing job has not started yet or it could mean
                 * that it already finished. So we wait until we see some progress (e.g. 25%) before we believe the number.
                 * This appears to be a problem with alternative cycles because they are small enough that the indexing finishes before
                 * any intermediate progress can be reported. So we never trust the value, we never clear the interval or resolve the promise,
                 * and we never leave this step.
                 */
                var oneHundredPercentIndexingIsAmbiguous = (newCycle.cycleType == 'Alternative Cycle');
                var ignoreCycleIndexTime = (progress === 100 && oneHundredPercentIndexingIsAmbiguous);

                var weKnowIndexingHasStarted = (progress < 100);

                if (weKnowIndexingHasStarted || ignoreCycleIndexTime) {
                    trustViewIndex = true;
                }

                if (trustViewIndex && progress == 100) {
                    clearInterval(intervalId);
                    waitForIndex.resolve();
                }
            });
        }

        return waitForIndex.promise;
    }
    function setCycleToNextPhase() {
        return cycleRepository.load(newCycle.id).then(function (newerCycle) {
            newerCycle.proceedToNextStep();
            return cycleRepository.update(newerCycle)
                .catch(function (err) {
                    Logger.log('Failed state transition: ', err);
                });
        });
    }
}

function getCycleCreationStatus( cycleId ){

    return cycleRepository.load(cycleId)
        .catch(function(err){
            throw new Error('no Cycle found with id '+cycleId);
        })
        .then(getStatusForCycle)
        .then(gatherStatusResults);

    function getStatusForCycle( cycle ){
        var couchJobsPromise = couchUtils.getRunningCouchJobs();

        return Q.all([
            getNewCycleReplicationStatus(cycle, couchJobsPromise),
            getViewIndexingStatus(cycle, couchJobsPromise),
            getOfferingTransformationStatus(cycle)
        ]);
    }

    function getNewCycleReplicationStatus( cycle, couchJobsPromise ){
        return couchJobsPromise.then(filterReplicationJobs).then(filterByTargetCycle).then(resolveToProgress);

        function filterReplicationJobs( jobs ){
            return jobs.filter(function(job){
                return job.type === 'replication';
            });
        }

        function filterByTargetCycle( jobs ){
            return jobs.filter(function(job){
                return job.target === cycle.getDatabaseName();
            });
        }
    }

    function getOfferingTransformationStatus( cycle ) {
        return cycle.offeringTransformationPercentComplete || 0;
    }

    function gatherStatusResults( resultsArray ){
        var replicationStatus = resultsArray[0] || 0;
        var viewIndexingStatus = resultsArray[1] || 0;
        var offeringTransformationStatus = resultsArray[2] || 0;

        return {
            replication: replicationStatus,
            viewIndexing: viewIndexingStatus,
            offeringTransformation: offeringTransformationStatus
        }
    }
}

function getViewIndexingStatus( cycle, couchJobsPromise ){
    if (!couchJobsPromise) {
        couchJobsPromise = couchUtils.getRunningCouchJobs();
    }
    return couchJobsPromise.then(filterIndexJobs).then(filterByCycle).then(resolveToProgress);

    function filterIndexJobs( jobs ){
        return jobs.filter(function(job){
            return job.type === 'indexer';
        });
    }

    function filterByCycle( jobs ){
        return jobs.filter(function(job){
            return job.database === cycle.getDatabaseName();
        });
    }
}

function resolveToProgress( jobs ){
    return jobs.length ? jobs[0].progress : 100;
}

function deleteCycle(cycleId) {
    var cycle = null;

    return cycleRepository.load(cycleId)
        .then(function(loadedCycle) {
            cycle = loadedCycle;
            return vendorRepository.list();
        })
        .then(function(vendorList) {
            var listOfDatabasesToDelete = cycleRepository.listAllDatabaseNamesForCycle(cycle, vendorList);

            Logger.log('Deleting databases', listOfDatabasesToDelete);

            return Q.allSettled(listOfDatabasesToDelete.map(couchUtils.deleteDatabase));
        })
        .finally(function(){
            Logger.log('Deleting cycle doc', cycleId);
            return cycleRepository.delete(cycleId);
        });
}

/* NEW CYCLE CREATION STUFF HERE */

function newCopyCycleDataFrom( sourceCycleId, newCycleId ){
    var sourceCycle = null;
    var newCycle = null;

    Logger.log('NEW CYCLE CREATION CODE!!!');
    //request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

    return loadCycles()
        .then(function() {
            console.log('GOT CYCLES', sourceCycle, newCycle);
        })
        // .then(replicate)
        // .then(indexViews)
        // .then(waitForIndexingToFinish)
        // .then(resetVendorStatuses)
        // .then(resetLibraryStatuses)
        // .then(transformProducts)
        // .then(transformOfferings)
        // .then(indexViews)
        // .then(waitForIndexingToFinish)
        // .then(setCycleToNextPhase)
        // .thenResolve(newCycleId)
        // .catch((err) => {
        //     Logger.log(err);
        //     throw err;
        // });

    function loadCycles() {
        return Q.all([
            cycleRepository.load(sourceCycleId),
            cycleRepository.load(newCycleId)
        ]).then(function (cycles) {
            sourceCycle = cycles[0];
            newCycle = cycles[1];
            return true;
        });
    }
    function replicate() {
        cycleRepository.createCycleLog('Replicating data from '+ sourceCycle.databaseName +' to '+ newCycle.databaseName);
        return couchUtils.replicateFrom(sourceCycle.databaseName).to(newCycle.databaseName)
    }
    function resetVendorStatuses() {
        cycleRepository.createCycleLog('Resetting vendor statuses for ' + newCycle.databaseName);
        return vendorRepository.list()
            .then(function(vendorList){
                return Q.all( vendorList.map(ensureVendorStatus) )
                    .then(function(){
                        return Q.all( vendorList.map(resetVendorStatus) );
                    });
            });

        function ensureVendorStatus(vendor){
            return vendorStatusRepository.ensureStatusExistsForVendor(vendor.id, newCycle);
        }
        function resetVendorStatus(vendor){
            return vendorStatusRepository.getStatusForVendor(vendor.id, newCycle)
                .then(function(vendorStatus){
                    var resetStatus = vendorStatusRepository.reset(vendorStatus, newCycle);
                    resetStatus.cycle = newCycle.id;
                    return vendorStatusRepository.update(resetStatus, newCycle);
                });
        }
    }
    function resetLibraryStatuses() {
        cycleRepository.createCycleLog('Ensuring all libraries have statuses for ' + newCycle.databaseName);

        return ensureLibraryStatuses()
            .then(function () {
                return libraryStatusRepository.list(newCycle)
                    .then(function (libraryStatusList) {
                        cycleRepository.createCycleLog('Resetting all library statuses for ' + newCycle.databaseName);
                        return Q.all(libraryStatusList.map(resetLibraryStatus));
                    });
            });

        function ensureLibraryStatuses() {
            return libraryRepository.list()
                .then(function(libraries) {
                    return Q.all( libraries.map(ensureStatusExistsForLibrary) );
                });

            function ensureStatusExistsForLibrary(library) {
                return libraryStatusRepository.ensureLibraryStatus(library.id, newCycle);
            }
        }

        function resetLibraryStatus(status) {
            var resetStatus = libraryStatusRepository.reset(status);
            resetStatus.cycle = newCycle.id;
            return libraryStatusRepository.update(resetStatus, newCycle);
        }
    }
    function transformProducts() {
        cycleRepository.createCycleLog('Transforming products for new cycle');
        return productRepository.transformProductsForNewCycle(newCycle);
    }
    function transformOfferings() {
        cycleRepository.createCycleLog('Transforming offerings for new cycle');
        return offeringRepository.transformOfferingsForNewCycle(newCycle, sourceCycle);
    }
    function indexViews() {
        cycleRepository.createCycleLog('Triggering view indexing for ' + newCycle.name + ' with database ' + newCycle.getDatabaseName());
        return couchUtils.triggerViewIndexing(newCycle.getDatabaseName());
    }
    function waitForIndexingToFinish() {
        var waitForIndex = Q.defer();

        var trustViewIndex = false;
        var intervalId = setInterval(checkIndexStatus, 1000);

        function checkIndexStatus() {
            getViewIndexingStatus(newCycle).then(function (progress) {
                /**
                 * We don't initially trust a value of 100 because that could mean the indexing job has not started yet or it could mean
                 * that it already finished. So we wait until we see some progress (e.g. 25%) before we believe the number.
                 * This appears to be a problem with alternative cycles because they are small enough that the indexing finishes before
                 * any intermediate progress can be reported. So we never trust the value, we never clear the interval or resolve the promise,
                 * and we never leave this step.
                 */
                var oneHundredPercentIndexingIsAmbiguous = (newCycle.cycleType == 'Alternative Cycle');
                var ignoreCycleIndexTime = (progress === 100 && oneHundredPercentIndexingIsAmbiguous);

                var weKnowIndexingHasStarted = (progress < 100);

                if (weKnowIndexingHasStarted || ignoreCycleIndexTime) {
                    trustViewIndex = true;
                }

                if (trustViewIndex && progress == 100) {
                    clearInterval(intervalId);
                    waitForIndex.resolve();
                }
            });
        }

        return waitForIndex.promise;
    }
    function setCycleToNextPhase() {
        return cycleRepository.load(newCycle.id).then(function (newerCycle) {
            newerCycle.proceedToNextStep();
            return cycleRepository.update(newerCycle)
                .catch(function (err) {
                    Logger.log('Failed state transition: ', err);
                });
        });
    }
}


module.exports = {
    create: create,
    copyCycleDataFrom: copyCycleDataFrom,
    newCopyCycleDataFrom: newCopyCycleDataFrom,
    getCycleCreationStatus: getCycleCreationStatus,
    deleteCycle: deleteCycle
};
