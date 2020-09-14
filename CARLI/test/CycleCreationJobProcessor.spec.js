var chai = require('chai');
var expect = chai.expect;
var Q = require('q');

var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

var couchUtilsSpy = createCouchUtilsSpy();
var testCycleCreationJob = createTestCycleCreationJob();
var cycleRepository = createCycleRepository();
var fakeTimestamper = fakeTimestamper('2020-08-22-19:34:21Z');

describe.only('The Cycle Creation Job Process', function(){

    beforeEach(function() {
        couchUtilsSpy = createCouchUtilsSpy();
        testCycleCreationJob = createTestCycleCreationJob();
        cycleRepository = createCycleRepository();
    });

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

        it('triggers replication if the status indicates replication has not happened', async function () {

            testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';

            var cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(couchUtilsSpy.replicateFromCalled).to.equal(1);
            expect(couchUtilsSpy.replicateToCalled).to.equal(1);

        });

        it('triggers index views if the status indicates replication has completed', async function() {

           testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';
           testCycleCreationJob.replicate = '2020-09-09-20:01:34';

           var cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy);
           await cycleCreationJobProcessor.process(testCycleCreationJob);
           expect(couchUtilsSpy.triggeredIndexingOnDatabase).to.equal('cycle-cycle2');
        });

        it('triggers cycle loading', async function() {

            var cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, {});
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.cyclesLoaded).deep.equals(['cycle1', 'cycle2']);
        });

        it('replicates the cycles', async function() {

            testCycleCreationJob.loadCycles = '0';

            const cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.logMessage).equals('Replicating data from cycle-'+ testCycleCreationJob.sourceCycle +' to cycle-'+ testCycleCreationJob.targetCycle);
        });
    });

    describe('getCurrentStepForJob function', function() {
        it('uses the steps in the correct order', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {});

            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('loadCycles');

            testCycleCreationJob['loadCycles'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('replicate');

            testCycleCreationJob['replicate'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('indexViews');

            testCycleCreationJob['indexViews'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('resetVendorStatus');

            testCycleCreationJob['resetVendorStatus'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('resetLibraryStatus');

            testCycleCreationJob['resetLibraryStatus'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('transformProducts');

            testCycleCreationJob['resetLibraryStatus'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('transformProducts');

            testCycleCreationJob['transformProducts'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('transformOfferings');

            testCycleCreationJob['transformOfferings'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('indexViewsPhase2');

            testCycleCreationJob['indexViewsPhase2'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('setCycleToNextPhase');

            testCycleCreationJob['setCycleToNextPhase'] = '2020-09-09-193402';
            currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            expect(currentStep).equals('done');
        });
    });

    describe('markStepCompleted function', function() {
        it('sets the time of completion to the current time for the given step', function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({}, {}, fakeTimestamper);

            cycleCreationJobProcessor._markStepCompleted(testCycleCreationJob, 'test');

            expect(testCycleCreationJob.test).equals('2020-08-22-19:34:21Z');
        });
    });

    describe('getViewIndexingStatus',  function() {
        it('should return 100 with an empty jobs promise', async function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy);

            const sourceCycle = await cycleRepository.load('0');

            const getRunningCouchJobsPromise = Q([]);
            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 100);
        });

        it('should return progress of a job with an non-empty jobs promise', async function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy);

            const sourceCycle = await cycleRepository.load('0');

            const job = {
                progress: 40,
                type: 'indexer'
            };

            const getRunningCouchJobsPromise = Q([job]);
            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 40);
        });

        it('should filter to only jobs that are indexing jobs', async function() {
            var cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy);

            const sourceCycle = await cycleRepository.load('0');

            const jobs = [
                { type: 'relaxing', progress: 40, },
                { type: 'indexer', progress: 70 }
            ];

            const getRunningCouchJobsPromise = Q(jobs);
            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 70);
        });
    });
        //Next step: add test and spy for next step in cycle copying, which is indexViews()
        // DONE - will need to add statuses to the cycleCreationJob objects
        //assert that the triggerViewIndexing method on couchUtils gets called
});

function createCouchUtilsSpy() {
    return {
        replicateFromCalled: 0,
        replicateToCalled: 0,
        triggeredIndexingOnDatabase: '',

        replicateFrom: function (sourceDbName) {
            this.replicateFromCalled++;
            return {
                to: (targetDbName) => {
                    this.replicateToCalled++;
                }
            };
        },
        triggerViewIndexing: function (databaseName) {
            this.triggeredIndexingOnDatabase = databaseName;
        }
    };
}

function createTestCycleCreationJob() {
    return {
        type: 'CycleCreationJob',
        sourceCycle: 'cycle1',
        targetCycle: 'cycle2'
    };
}

function createCycleRepository() {
    return {
        cyclesLoaded: [],
        logMessage: '',
        load: function (cycleID) {
            this.cyclesLoaded.push(cycleID);
            return Q({
                getDatabaseName: () => {
                    return 'cycle-' + cycleID;
                }
            });

        },
        createCycleLog: function (message) {
            this.logMessage = message;
        }
    };
}

function fakeTimestamper(expectedTimestamp) {
    return {
        getCurrentTimestamp: function() {
            return expectedTimestamp;
        }
    }
}
