const Q = require('q');
const cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');
const IndexingStatusTracker = require("./IndexingStatusTracker");

function CycleCreationJobProcessor(
        {
            cycleRepository,
            couchUtils,
            timestamper,
            productRepository,
            offeringRepository,
            vendorRepository,
            libraryRepository,
            libraryStatusRepository,
            vendorStatusRepository,
            cycleCreationJobRepository
        })
{

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
        'replicateDataToVendorsForCycle',
        'triggerIndexingForCycleId',
        'setCycleToNextPhase',
        'done'
    ]

    async function create(targetCycle) {
        Logger.log("[CycleCreationJobProcessor] [START] creating cycle entity");
        let targetCycleId = await cycleRepository.create(targetCycle, couchUtils.DB_TYPE_STAFF | couchUtils.DB_TYPE_LIBRARY)
        Logger.log("[CycleCreationJobProcessor] [END] creating cycle entity");
        Logger.log("[CycleCreationJobProcessor] [START] creating vendor databases for cycle");
        await createVendorDatabasesForCycle(targetCycleId);
        Logger.log("[CycleCreationJobProcessor] [END] creating vendor databases for cycle");
        return targetCycleId;
    }

    async function createVendorDatabasesForCycle(cycleId) {

        const allVendors = await vendorRepository.list();

        const promises = allVendors.map( function (vendor) {
            const repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.createDatabase(cycleId);
        });

        return Q.all(promises);
    }

    async function loadCycles(job) {
        sourceCycle = await cycleRepository.load(job.sourceCycle);
        newCycle = await cycleRepository.load(job.targetCycle);
        return true;
    }

    async function  process(cycleCreationJobId) {
        if (!(await isValidCycleCreationJob(cycleCreationJobId)))
            throw new Error('invalid cycle creation job');

        await markJobRunning(cycleCreationJobId);
        var currentStep = await getCurrentStepForJob(cycleCreationJobId);
        var stepAction = getStepAction(currentStep);

        try {
            const cycleCreationJob = await cycleCreationJobRepository.load(cycleCreationJobId);
            const stepResult = await stepAction(cycleCreationJob);
            await markStepCompleted(cycleCreationJobId, currentStep);
            await markJobStopped(cycleCreationJobId);
            //return stepResult;

            return {
                succeeded: true,
                result: stepResult
            };
        }
        catch (e) {
            const message = "An error occurred during step '" + currentStep + " Error: " + e;
            await logMessageToJob(cycleCreationJobId, message);

            Logger.log(e);
            Logger.log(e.stack);

            return {
                succeeded: false,
                error: e
            };
        }
    }

    async function logMessageToJob(jobId, message) {
        const cycleCreationJob = await cycleCreationJobRepository.load(jobId);

        if(!cycleCreationJob.logMessages){
            cycleCreationJob.logMessages = [];
        }

        cycleCreationJob.logMessages.push({
            timestamp: timestamper.getCurrentTimestamp(),
            message: message
        });

        await cycleCreationJobRepository.update(cycleCreationJob);
    }

    async function isValidCycleCreationJob(jobId) {
        const cycleCreationJob = await cycleCreationJobRepository.load(jobId);

        return typeof cycleCreationJob === 'object' && cycleCreationJob.type === 'CycleCreationJob';
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

    async function markStepCompleted(jobId, step) {
        const job = await cycleCreationJobRepository.load(jobId);
        job[step] = timestamper.getCurrentTimestamp();

        const currentStep = await getCurrentStepForJob(job.id);
        if(currentStep === 'done') {
            job.completed = true;
        }

        await cycleCreationJobRepository.update(job);
    }

    async function markJobRunning(jobId) {
        const job = await cycleCreationJobRepository.load(jobId);
        job.running = true;
        await cycleCreationJobRepository.update(job);
    }

    async function markJobStopped(jobId) {
        const job = await cycleCreationJobRepository.load(jobId);
        job.running = false;
        await cycleCreationJobRepository.update(job);
    }

    async function getCurrentStepForJob(cycleCreationJobId) {
        const job = await cycleCreationJobRepository.load(cycleCreationJobId)
        for (var i = 0; i < stepOrder.length; i++) {
            if (job[stepOrder[i]] === undefined) {
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

        const allVendors = await vendorRepository.list();

        const promise = allVendors.reduce((promiseChain, vendor) => {
            return promiseChain.then(async () => {
                const repoForVendor = cycleRepositoryForVendor(vendor);
                const cycleForVendor = await repoForVendor.load(job.targetCycle);
                await cycleForVendor.replicateFromSource();
                Logger.log("[CycleCreationJobProcessor] [END] finished replicating data to vendor " + vendor.id);
            });
        }, Q.when(true));

        await promise;
    }

    async function triggerIndexingForCycleId(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        const databaseNamesToIndex = await getDatabaseNamesToIndex();

        databaseNamesToIndex.forEach(databaseName => {
            couchUtils.triggerViewIndexing(databaseName);
        });

        async function getDatabaseNamesToIndex() {
            const vendorCycleRepositories = await getVendorCycleRepositories();

            return vendorCycleRepositories.map(function (vendorInstance) {
                return vendorInstance.getDatabaseName();
            });
        }

        async function getVendorCycleRepositories() {
            const allVendors = await vendorRepository.list();

            const vendorCycleRepositoryPromises = allVendors.map(async function (vendorName) {
                return cycleRepositoryForVendor(vendorName).load(newCycle.id);
            });
            return await Q.all(vendorCycleRepositoryPromises);
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
        _markJobRunning: markJobRunning,
        _markJobStopped: markJobStopped,
        _waitForIndexingToFinish: waitForIndexingtoFinish,
        _getViewIndexingStatus: getViewIndexingStatus,
        _transformProducts: transformProducts,
        _transformOfferings: transformOfferings,
        _steps: stepOrder
    }
}

module.exports = CycleCreationJobProcessor;

