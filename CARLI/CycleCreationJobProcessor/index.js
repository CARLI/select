var Q = require('q');
function CycleCreationJobProcessor(cycleRepository, couchUtils, offeringRepository, libraryStatusRepository, vendorStatusRepository) {
    return {
        sourceCycle: null,
        targetCycle: null,
        stepOrder: [
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
        ],

        getStepAction: function(step) {
            var stepActions = {
                'loadCycles': this.loadCycles.bind(this),
                'replicate': this.replicate.bind(this),
                'indexViews': this.triggerIndexViews.bind(this),
                'resetVendorStatus': function() { return null; },
                'resetLibraryStatus': function() { return null; },
                'transformProducts': function() { return null; },
                'transformOfferings': function() { return null; },
                'indexViewsPhase2' : this.triggerIndexViews.bind(this),
                'setCycleToNextPhase': function() { return null; },
                'done': function() { return null; }
            };

            return stepActions[step];
        },

        getCurrentTimestamp: function() {
            return new Date().toISOString();
        },

        process: function(cycleCreationJob) {
            if (typeof cycleCreationJob !== 'object' || cycleCreationJob.type !== 'CycleCreationJob')
                throw new Error('invalid cycle creation job');

            var currentStep = this.getCurrentStepForJob(cycleCreationJob);
            var stepAction = this.getStepAction(currentStep);
            return Q(stepAction(cycleCreationJob));
        },

        loadCycles: async function(job) {
            this.sourceCycle = await cycleRepository.load(job.sourceCycle);
            this.newCycle = await cycleRepository.load(job.targetCycle);
            return true;
        },

        replicate: async function(job) {
            if(!this.sourceCycle) {
                await this.loadCycles(job);
            }

            cycleRepository.createCycleLog('Replicating data from '+ this.sourceCycle.getDatabaseName() +' to '+ this.newCycle.getDatabaseName());
            return couchUtils.replicateFrom(this.sourceCycle.getDatabaseName()).to(this.newCycle.getDatabaseName());
        },

        triggerIndexViews: async function(job) {
            if(!this.sourceCycle) {
                await this.loadCycles(job);
            }

            cycleRepository.createCycleLog('Triggering view indexing for ' + this.newCycle.name + ' with database ' + this.newCycle.getDatabaseName());
            return couchUtils.triggerViewIndexing(this.newCycle.getDatabaseName());
        },

        markStepCompleted: function(job, step) {
            job[step] = this.getCurrentTimestamp();
        },

        getCurrentStepForJob: function(cycleCreationJob) {
            for(var i = 0; i < this.stepOrder.length; i++) {
                if(cycleCreationJob[this.stepOrder[i]] === undefined) {
                    return this.stepOrder[i];
                }
            }
        },

        getViewIndexingStatus: async function(cycle, couchJobsPromise) {
            const jobs = await couchJobsPromise;

            return resolveToProgress(filterIndexJobs(jobs));

            function filterIndexJobs( jobs ){
                return jobs.filter(function(job){
                    return job.type === 'indexer';
                });
            }

            function resolveToProgress( jobs ){
                return jobs.length ? jobs[0].progress : 100;
            }
        }
    }
}

module.exports = CycleCreationJobProcessor;
