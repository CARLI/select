var chai = require('chai');
var expect = chai.expect;
var Q = require('q');

var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

var couchUtilsSpy = createCouchUtilsSpy();
var testCycleCreationJob = createTestCycleCreationJob();
var cycleRepository = createCycleRepository();
var fakeTimestamper = fakeTimestamper('2020-08-22-19:34:21Z');
let cycleCreationJobProcessor;

describe.only('The Cycle Creation Job Process', function(){
    beforeEach(function() {
        couchUtilsSpy = createCouchUtilsSpy();
        testCycleCreationJob = createTestCycleCreationJob();
        cycleRepository = createCycleRepository();
        cycleCreationJobProcessor = CycleCreationJobProcessor(cycleRepository, couchUtilsSpy, fakeTimestamper);
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

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(couchUtilsSpy.replicateFromCalled).to.equal(1);
            expect(couchUtilsSpy.replicateToCalled).to.equal(1);

        });

        it('triggers index views if the status indicates replication has completed', async function() {
           testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';
           testCycleCreationJob.replicate = '2020-09-09-20:01:34';

           await cycleCreationJobProcessor.process(testCycleCreationJob);
           expect(couchUtilsSpy.triggeredIndexingOnDatabase).to.equal('cycle-cycle2');
        });

        it('triggers cycle loading', async function() {
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.cyclesLoaded).deep.equals(['cycle1', 'cycle2']);
        });

        it('replicates the cycles', async function() {
            testCycleCreationJob.loadCycles = '0';

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.logMessage).equals('Replicating data from cycle-'+ testCycleCreationJob.sourceCycle +' to cycle-'+ testCycleCreationJob.targetCycle);
        });
    });

    describe('getCurrentStepForJob function', function() {
        it('uses the steps in the correct order', function() {
            expectNextStepToBe(null, 'loadCycles');
            expectNextStepToBe('loadCycles', 'replicate');
            expectNextStepToBe('replicate', 'indexViews');
            expectNextStepToBe('indexViews', 'resetVendorStatus');
            expectNextStepToBe('resetVendorStatus', 'resetLibraryStatus');
            expectNextStepToBe('resetLibraryStatus', 'transformProducts');
            expectNextStepToBe('transformProducts', 'transformOfferings');
            expectNextStepToBe('transformOfferings', 'indexViewsPhase2');
            expectNextStepToBe('indexViewsPhase2', 'setCycleToNextPhase');
            expectNextStepToBe('setCycleToNextPhase', 'done');

            function expectNextStepToBe(currentStep, nextStep) {
                if(currentStep)
                    cycleCreationJobProcessor._markStepCompleted(currentStep);

                nextStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
                expect(nextStep).equals(nextStep);
            }
        });
    });

    describe('markStepCompleted function', function() {
        it('sets the time of completion to the current time for the given step', function() {
            cycleCreationJobProcessor._markStepCompleted(testCycleCreationJob, 'test');
            expect(testCycleCreationJob.test).equals('2020-08-22-19:34:21Z');
        });
    });

    describe('getViewIndexingStatus',  function() {
        let sourceCycle;

        beforeEach(async () => {
            sourceCycle = await cycleRepository.load('0');
        });

        it('should return 100 with an empty jobs promise', async function() {
            const getRunningCouchJobsPromise = Q([]);

            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 100);
        });

        it('should return progress of a job with an non-empty jobs promise', async function() {
            const getRunningCouchJobsPromise = Q([
                {progress: 40, type: 'indexer', database: 'cycle-0'}
            ]);

            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 40);
        });

        it('should filter to only jobs that are indexing jobs', async function() {
            const getRunningCouchJobsPromise = Q([
                {type: 'relaxing', progress: 40, database: 'cycle-0'},
                {type: 'indexer', progress: 70, database: 'cycle-0'}
            ]);

            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 70);
        });

        it('should filter to only jobs that match the given cycle', async function() {
            const getRunningCouchJobsPromise = Q([
                {type: 'indexer', progress: 40, database: 'cycle-1'},
                {type: 'indexer', progress: 70, database: 'cycle-0'}
            ]);

            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals( 70);
        });
    });
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
