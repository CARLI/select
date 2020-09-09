var chai = require('chai');
var expect = chai.expect;

var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

describe.only('The Cycle Creation Job Process', function(){
    it('should be a constructor function', function(){
        expect(CycleCreationJobProcessor).to.be.a('function');
    });

    it('needs to be injected with the repositories and returns an instance', function() {
       var cycleCreationJobProcessor = CycleCreationJobProcessor({});
       expect(cycleCreationJobProcessor).to.be.an('object');
    });

    describe('the process method', function() {
        it('throws an error if called with invalid input', function () {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({});

            function callWithNoInput() {
                cycleCreationJobProcessor.process()
            }

            function callWithBadInput() {
                cycleCreationJobProcessor.process('')
            }

            expect(callWithNoInput).to.throw(/invalid cycle creation job/);
            expect(callWithBadInput).to.throw(/invalid cycle creation job/);
        });

        it('triggers replication if the status indicates replication has not happened', function () {
            var couchUtilsSpy = {
                replicateCalled: 0,
                replicate: function () {
                    this.replicateCalled++;
                }
            };
            var testCycleCreationJob = {
                type: 'CycleCreationJob',
                sourceCycle: '',
                targetCycle: ''
            };

            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, couchUtilsSpy);
            cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(couchUtilsSpy.replicateCalled).to.equal(1);
        });
    });

    describe('getCurrentStepForJob function', function() {
        it('starts with loading cycles', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {});
            var testCycleCreationJob = {
                type: 'CycleCreationJob',
                sourceCycle: '',
                targetCycle: ''
            };

            var currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('loadCycles');
        });

        it('follows loading cycles with replicate', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {});
            var testCycleCreationJob = {
                type: 'CycleCreationJob',
                sourceCycle: '',
                targetCycle: '',
                loadCycles: '2020-09-09-193402'
            };

            var currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('replicate');
        });

        it('follows loading cycles with indexViews', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {});
            var testCycleCreationJob = {
                type: 'CycleCreationJob',
                sourceCycle: '',
                targetCycle: '',
                loadCycles: '2020-09-09-193402',
                replicate: '2020-09-09-193402'

            };

            var currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('indexViews');
        });
    });

        // getCurrentStepForJob(job)

        // markStepCompleted(job, step)

        /*const dude = {
            type: 'CycleCreationJob',
            sourceCycle: '2019',
            targetCycle: '2020',
            LoadCycles: '2020-09-09-192022',
            Replicate: '2020-09-09-193101',
            IndexViews: '',
            ResetVendorStatuses: '',
            ResetLibraryStatuses: '',
            transformProducts: '',
            transformOfferings: '',




    }*/

        // define the order of the steps
        // know which step we're on
        // be able to mark a step as complete


        //Next step: add test and spy for next step in cycle copying, which is indexViews()
        //will need to add statuses to the cycleCreationJob objects
        //assert that the triggerViewIndexing method on couchUtils gets called
        //

        /*
        loadCycles()
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
         */
});
