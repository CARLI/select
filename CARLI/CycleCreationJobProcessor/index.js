var Q = require('q');
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
        'done'
    ]

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
            await vendorStatusRepository.ensureStatusExistsForVendor(vendor, newCycle);
            const status = await vendorStatusRepository.getStatusForVendor(vendor, newCycle);
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
            await libraryStatusRepository.ensureStatusExistsForLibrary(library, newCycle);
            const status = await libraryStatusRepository.getStatusForLibrary(library, newCycle);
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
            'done': function () {
                return null;
            }
        };
        return stepActions[step];
    }

    return {
        process,
        _getCurrentStepForJob: getCurrentStepForJob,
        _markStepCompleted: markStepCompleted,
        _waitForIndexingToFinish: waitForIndexingtoFinish,
        _getViewIndexingStatus: getViewIndexingStatus,
        _transformProducts: transformProducts,
        _transformOfferings: transformOfferings
    }
}

module.exports = CycleCreationJobProcessor;
