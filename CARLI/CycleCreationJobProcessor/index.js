function CycleCreationJobProcessor(cycleRepository, couchUtils, offeringRepository, libraryStatusRepository, vendorStatusRepository) {
    return {
        process: function(cycleCreationJob) {
            if (typeof cycleCreationJob !== 'object' || cycleCreationJob.type !== 'CycleCreationJob')
                throw new Error('invalid cycle creation job');

            couchUtils.replicate();
        },

        getCurrentStepForJob: function(cycleCreationJob) {
            var steps = [
                'loadCycles',
                'replicate',
                'indexViews'
            ];

            for(var i = 0; i < steps.length; i++) {
                if(cycleCreationJob[steps[i]] === undefined) {
                    return steps[i];
                }
            }
        }
    }
}

module.exports = CycleCreationJobProcessor;
