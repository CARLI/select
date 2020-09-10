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
                targetCycle: '',
                loadCycles: '2020-09-09-20:01:34'
            };

            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, couchUtilsSpy);
            cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(couchUtilsSpy.replicateCalled).to.equal(1);
        });

        it('triggers index views if the status indicates replication has completed', function() {
           var couchUtilsSpy = {
               replicateCalled: 0,
               triggeredIndexingOnDatabase: '',

               replicate: function () {
                   this.replicateCalled++;
               },
               triggerIndexViews: function(databaseName) {
                   this.triggeredIndexingOnDatabase = databaseName;
               }
           };
           var testCycleCreationJob = {
               type: 'CycleCreationJob',
               sourceCycle: '',
               targetCycle: '',
               loadCycles: '2020-09-09-20:01:34',
               replicate: '2020-09-09-20:01:34'
           };

           var cycleCreationJobProcessor = CycleCreationJobProcessor({}, couchUtilsSpy);
           cycleCreationJobProcessor.process(testCycleCreationJob);
           expect(couchUtilsSpy.triggeredIndexingOnDatabase).to.equal('i have no idea');
        });
    });

    describe('getCurrentStepForJob function', function() {
        it('uses the steps in the correct order', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {});
            var testCycleCreationJob = {
                type: 'CycleCreationJob',
                sourceCycle: '',
                targetCycle: ''
            };

            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('loadCycles');

            testCycleCreationJob['loadCycles'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('replicate');

            testCycleCreationJob['replicate'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('indexViews');

            testCycleCreationJob['indexViews'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('resetVendorStatus');

            testCycleCreationJob['resetVendorStatus'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('resetLibraryStatus');

            testCycleCreationJob['resetLibraryStatus'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('transformProducts');

            testCycleCreationJob['resetLibraryStatus'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('transformProducts');

            testCycleCreationJob['transformProducts'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('transformOfferings');

            testCycleCreationJob['transformOfferings'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('indexViewsPhase2');

            testCycleCreationJob['indexViewsPhase2'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('setCycleToNextPhase');

            testCycleCreationJob['setCycleToNextPhase'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor.getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('done');
        });
    });

    describe('markStepCompleted function', function() {
        it('sets the time of completion to the current time for the given step', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {});
            var testCycleCreationJob = {
                type: 'CycleCreationJob',
                sourceCycle: '',
                targetCycle: ''
            };

            var expectedTimestamp = '2020-08-22-19:34:21Z';

            cycleCreationJobProcessor.getCurrentTimestamp = function() { return expectedTimestamp; };
            cycleCreationJobProcessor.markStepCompleted(testCycleCreationJob, 'test');

            expect(testCycleCreationJob.test, expectedTimestamp);
        });
    });
        //Next step: add test and spy for next step in cycle copying, which is indexViews()
        // DONE - will need to add statuses to the cycleCreationJob objects
        //assert that the triggerViewIndexing method on couchUtils gets called
});
