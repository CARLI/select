var Q = require('q');

function CycleCreationJobProcessor(cycleRepository, couchUtils, timestamper, offeringRepository, libraryStatusRepository, vendorStatusRepository) {

    var sourceCycle = null;
    var targetCycle = null;
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

    function process(cycleCreationJob) {
        if (typeof cycleCreationJob !== 'object' || cycleCreationJob.type !== 'CycleCreationJob')
            throw new Error('invalid cycle creation job');

        var currentStep = getCurrentStepForJob(cycleCreationJob);
        var stepAction = getStepAction(currentStep);
        return Q(stepAction(cycleCreationJob));
    }

    async function loadCycles(job) {
        sourceCycle = await cycleRepository.load(job.sourceCycle);
        newCycle = await cycleRepository.load(job.targetCycle);
        return true;
    }

    async function replicate(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Replicating data from ' + sourceCycle.getDatabaseName() + ' to ' + newCycle.getDatabaseName());
        return couchUtils.replicateFrom(sourceCycle.getDatabaseName()).to(newCycle.getDatabaseName());
    }

    async function triggerIndexViews(job) {
        if (!sourceCycle) {
            await loadCycles(job);
        }

        cycleRepository.createCycleLog('Triggering view indexing for ' + newCycle.name + ' with database ' + newCycle.getDatabaseName());
        return couchUtils.triggerViewIndexing(newCycle.getDatabaseName());
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

    async function getViewIndexingStatus(cycle, couchJobsPromise) {
        const jobs = await couchJobsPromise;

        return resolveToProgress(filterIndexJobs(filterCycleJobs(jobs)));

        function filterIndexJobs(jobs) {
            return jobs.filter(function (job) {
                return job.type === 'indexer';
            });
        }

        function filterCycleJobs(jobs) {
            return jobs.filter(function (job) {
                return job.database === cycle.getDatabaseName();
            });
        }

        function resolveToProgress(jobs) {
            return jobs.length ? jobs[0].progress : 100;
        }
    }

    function getStepAction(step) {
        var stepActions = {
            'loadCycles': loadCycles,
            'replicate': replicate,
            'indexViews': triggerIndexViews,
            'resetVendorStatus': function () {
                return null;
            },
            'resetLibraryStatus': function () {
                return null;
            },
            'transformProducts': function () {
                return null;
            },
            'transformOfferings': function () {
                return null;
            },
            'indexViewsPhase2': triggerIndexViews,
            'setCycleToNextPhase': function () {
                return null;
            },
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
        _getViewIndexingStatus: getViewIndexingStatus
    }
}

module.exports = CycleCreationJobProcessor;
