function CycleCreationJobProcessor(cycleRepository, couchUtils, offeringRepository, libraryStatusRepository, vendorStatusRepository) {
    return {
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
                'loadCycles': function() { return null; },
                'replicate': this.replicate,
                'indexViews': this.triggerIndexViews,
                'resetVendorStatus': function() { return null; },
                'resetLibraryStatus': function() { return null; },
                'transformProducts': function() { return null; },
                'transformOfferings': function() { return null; },
                'indexViewsPhase2' : function() { return null; },
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
            stepAction();
        },

        replicate: function() {
            couchUtils.replicate();
        },

        triggerIndexViews: function() {
            couchUtils.triggerIndexViews('i have no idea');
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
        }
    }
}

module.exports = CycleCreationJobProcessor;
