const Q = require('q');
const cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');
const IndexingStatusTracker = require("./IndexingStatusTracker");

function CycleCreationJobProcessor({cycleRepository, couchUtils, timestamper, productRepository, offeringRepository, vendorRepository, libraryRepository, libraryStatusRepository, vendorStatusRepository}) {

    var sourceCycle = null;
    var newCycle = null;

    var stepOrder = [
        'loadCycles',
        'replicate',
        'indexViews',
        'resetVendorStatus',
        'resetLibraryStatus',
        'transformProducts',
        'transformOfferings',
        'indexViewsPhase2',
        'setCycleToNextPhase',

        // Create Shards
        'replicateDataToVendorsForCycle',
        'triggerIndexingForCycleId',

        'done'
    ]

    async function create(targetCycle) {
        await cycleRepository.create(targetCycle, couchUtils.DB_TYPE_STAFF | couchUtils.DB_TYPE_LIBRARY)
        await createVendorDatabasesForCycle(targetCycle.id);
    }

    async function createVendorDatabasesForCycle(cycleId) {

        const allVendors = await vendorRepository.list();

        const promises = allVendors.map( async function (vendor) {
            const repoForVendor = cycleRepositoryForVendor(vendor);
            await repoForVendor.createDatabase(cycleId);
        });

        await Q.all(promises);
    }

    async function loadCycles(job) {
        sourceCycle = await cycleRepository.load(job.sourceCycle);
        newCycle = await cycleRepository.load(job.targetCycle);
        return true;
    }

    async function process(cycleCreationJob) {
        if (typeof cycleCreationJob !== 'object' || cycleCreationJob.type !== 'CycleCreationJob')
            throw new Error('invalid cycle creation job');

        var currentStep = getCurrentStepForJob(cycleCreationJob);
        var stepAction = getStepAction(currentStep);

        const stepResult = await stepAction(cycleCreationJob);
        markStepCompleted(cycleCreationJob, currentStep);

        return stepResult;
    }

    async function replicate(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Replicating data from ' + sourceCycle.getDatabaseName() + ' to ' + newCycle.getDatabaseName());
        return couchUtils.replicateFrom(sourceCycle.getDatabaseName()).to(newCycle.getDatabaseName());
    }

    async function resetVendorStatuses(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Resetting vendor statuses for ' + newCycle.databaseName);
        const allVendors = await vendorRepository.list();

        const promises = allVendors.map( async function (vendor) {
            await vendorStatusRepository.ensureStatusExistsForVendor(vendor.id, newCycle);
            const status = await vendorStatusRepository.getStatusForVendor(vendor.id, newCycle);
            const resetStatus = vendorStatusRepository.reset(status, newCycle);
            resetStatus.cycle = newCycle.id;
            await vendorStatusRepository.update(resetStatus, newCycle);
            return resetStatus;
        });

        await Q.all(promises);
    }

    async function resetLibraryStatuses(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Ensuring all libraries have statuses for ' + newCycle.databaseName);

        const allLibraries = await libraryRepository.list();

        const promises = allLibraries.map( async function (library) {
            await libraryStatusRepository.ensureLibraryStatus(library.id, newCycle);
            const status = await libraryStatusRepository.getStatusForLibrary(library.id, newCycle);
            const resetStatus = libraryStatusRepository.reset(status, newCycle);
            resetStatus.cycle = newCycle.id;
            await libraryStatusRepository.update(resetStatus, newCycle);
            return resetStatus;
        });

        await Q.all(promises);

    }

    async function transformProducts(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Transforming products for new cycle');
        return productRepository.transformProductsForNewCycle(newCycle);
    }

    async function transformOfferings(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }
        cycleRepository.createCycleLog('Transforming offerings for new cycle');
        return offeringRepository.transformOfferingsForNewCycle(newCycle, sourceCycle);
    }

    async function triggerIndexViews(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Triggering view indexing for ' + newCycle.name + ' with database ' + newCycle.getDatabaseName());
        return couchUtils.triggerViewIndexing(newCycle.getDatabaseName());
    }

    async function setCycleToNextPhase(job) {
        await loadCycles(job);
        newCycle.proceedToNextStep();

        try {
            await cycleRepository.update(newCycle)
        }
        catch(err) {
            Logger.log('Failed state transition: ', err);
        }
    }

    function markStepCompleted(job, step) {
        job[step] = timestamper.getCurrentTimestamp();
    }

    function getCurrentStepForJob(cycleCreationJob) {
        for (var i = 0; i < stepOrder.length; i++) {
            if (cycleCreationJob[stepOrder[i]] === undefined) {
                return stepOrder[i];
            }
        }
    }

    async function waitForIndexingtoFinish(cycle) {
        const getProgress = () => getViewIndexingStatus(cycle, couchUtils.getRunningCouchJobs());
        const indexTracker = IndexingStatusTracker(getProgress, cycle);

        await indexTracker.start();
    }

    async function getViewIndexingStatus(cycle, couchJobsPromise) {
        const indexingJobsForCycle = (await couchJobsPromise)
            .filter(filterIndexJobs)
            .filter(filterCycleJobs);

        return getProgressForFirstJob(indexingJobsForCycle);

        function filterIndexJobs(job) {
            return job.type === 'indexer';
        }

        function filterCycleJobs(job) {
            return job.database === cycle.getDatabaseName();
        }

        function getProgressForFirstJob(jobs) {
            return jobs.length ? jobs[0].progress : 100;
        }
    }

    async function replicateDataToVendorsForCycle(job) {
/*        if (!sourceCycle) {
            await loadCycles(job);
        }*/
        const allVendors = await vendorRepository.list();
        const promises = allVendors.map( async function (vendor) {
            const repoForVendor = cycleRepositoryForVendor(vendor);
            const cycleForVendor = await repoForVendor.load(job.targetCycle);
            return cycleForVendor.replicateFromSource();
        });
        await Q.all(promises);
    }

    async function triggerIndexingForCycleId(cycleId) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.load(cycleId);
        couchUtils.triggerViewIndexing(cycle.getDatabaseName())
        vendorRepository.list();

        const instancePromises = vendors.map( async function (vendor) {
            cycleRepositoryForVendor(vendor).load(cycle.id)
        });
        await Q.all(instancePromises);

        const indexPromises = cycles.map( async function (cycleForVendor) {
            couchUtils.triggerViewIndexing(cycleForVendor.getDatabaseName());
        });
        await Q.all(indexPromises);
    }

    function getStepAction(step) {
        var stepActions = {
            'loadCycles': loadCycles,
            'replicate': replicate,
            'indexViews': triggerIndexViews,
            'resetVendorStatus': resetVendorStatuses,
            'resetLibraryStatus': resetLibraryStatuses,
            'transformProducts': transformProducts,
            'transformOfferings': transformOfferings,
            'indexViewsPhase2': triggerIndexViews,
            'setCycleToNextPhase': setCycleToNextPhase,
            'replicateDataToVendorsForCycle': replicateDataToVendorsForCycle,
            'triggerIndexingForCycleId': triggerIndexingForCycleId,
            'done': function () {
                return null;
            }
        };
        return stepActions[step];
    }

    return {
        process,
        initializeNewCycle: create,
        _getCurrentStepForJob: getCurrentStepForJob,
        _markStepCompleted: markStepCompleted,
        _waitForIndexingToFinish: waitForIndexingtoFinish,
        _getViewIndexingStatus: getViewIndexingStatus,
        _transformProducts: transformProducts,
        _transformOfferings: transformOfferings
    }
}

module.exports = CycleCreationJobProcessor;

