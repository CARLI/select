var chai = require('chai');
var expect = chai.expect;
var Q = require('q');
var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

describe.only('The Cycle Creation Job Process', function(){
    let couchUtilsSpy;
    let testCycleCreationJob;
    let cycleRepository;
    let productRepositorySpy;
    let offeringRepositorySpy;
    let vendorRepositorySpy;
    let cycleCreationJobProcessor;
    let vendorStatusRepositorySpy;

    beforeEach(function() {
        let fakeTimestamper = createFakeTimestamper('2020-08-22-19:34:21Z');
        couchUtilsSpy = createCouchUtilsSpy();
        testCycleCreationJob = createTestCycleCreationJob();
        cycleRepository = createCycleRepository();
        productRepositorySpy = createProductRepositorySpy();
        offeringRepositorySpy = createOfferingRepositorySpy();
        vendorRepositorySpy = createVendorRepository();
        vendorStatusRepositorySpy = createVendorStatusRepository();
        cycleCreationJobProcessor = CycleCreationJobProcessor({
            cycleRepository: cycleRepository,
            couchUtils: couchUtilsSpy,
            timestamper: fakeTimestamper,
            productRepository: productRepositorySpy,
            offeringRepository: offeringRepositorySpy,
            vendorRepository: vendorRepositorySpy,
            vendorStatusRepository: vendorStatusRepositorySpy
        });
    });

    describe('the process method', function() {
        it('throws an error if called with invalid input', async function () {
            var cycleCreationJobProcessor = CycleCreationJobProcessor({});

            let noInputErrorThrown = false;
            let badInputErrorThrown = false;

            try {
                await cycleCreationJobProcessor.process();
            }
            catch (error) {
                if(error.message === "invalid cycle creation job")
                    noInputErrorThrown = true;
            }

            try {
                await cycleCreationJobProcessor.process('');
            }
            catch (error) {
                if(error.message === "invalid cycle creation job")
                    badInputErrorThrown = true;
            }

            expect(noInputErrorThrown).is.true;
            expect(badInputErrorThrown).is.true;
        });

        it(`marks the step completed when finished`, async () => {
            testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob))
                .equals('indexViews');
        });

        it('triggers replication if the status indicates replication has not happened', async function () {
            testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(couchUtilsSpy.replicateFromCalled).to.equal(1);
            expect(couchUtilsSpy.replicateToCalled).to.equal(1);
        });

        it('triggers index views if the status indicates replication has completed', async function () {

            testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';
            testCycleCreationJob.replicate = '2020-09-09-20:01:34';

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(couchUtilsSpy.triggeredIndexingOnDatabase).to.equal('cycle-cycle2');
        });

        it('triggers cycle loading', async function () {

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.cyclesLoaded).deep.equals(['cycle1', 'cycle2']);
        });

        it('replicates the cycles', async function () {

            testCycleCreationJob.loadCycles = '0';

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.logMessage).equals('Replicating data from cycle-' + testCycleCreationJob.sourceCycle + ' to cycle-' + testCycleCreationJob.targetCycle);
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

    describe('getViewIndexingStatus function',  function() {
        let sourceCycle;

        beforeEach(async () => {
            sourceCycle = await cycleRepository.load('0');
        });

        it('should return 100 with an empty jobs promise', async function() {
            const getRunningCouchJobsPromise = Q([]);
            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals(100);
        });

        it('should return progress of a job with an non-empty jobs promise', async function() {
            const getRunningCouchJobsPromise = Q([
                {progress: 40, type: 'indexer', database: 'cycle-0'}
            ]);
            const result = await cycleCreationJobProcessor._getViewIndexingStatus(sourceCycle, getRunningCouchJobsPromise);
            expect(result).equals(40);
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
            expect(result).equals(70);
        });
    });

    describe(`waitForIndexingToFinish function`, () => {
        let sourceCycle;

        beforeEach(async () => {
            sourceCycle = await cycleRepository.load('0');
        });

        it(`exists`, () => {
            cycleCreationJobProcessor._waitForIndexingToFinish();
        });

        it(`is not finished if progress is less than 100 percent`, async () => {
            const couchJobsPromise = Q([
                {type: 'indexer', progress: 40, database: 'cycle-0'},
            ]);

            couchUtilsSpy.getRunningCouchJobs = () => couchJobsPromise;
            const result = await cycleCreationJobProcessor._waitForIndexingToFinish(sourceCycle);
            expect(result).to.be.false;
        });

    });

    describe(`resetVendorStatus function`, () => {

        let newCycle;

        beforeEach(async () => {
            newCycle = await cycleRepository.load('1');
            testCycleCreationJob.loadCycles = 'filler';
            testCycleCreationJob.replicate = 'filler';
            testCycleCreationJob.indexViews = 'filler';
        });

        it('calls resetVendorStatus', async function () {
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.logMessage).equals('Resetting vendor statuses for ' + newCycle.databaseName);
        });

        it('resets vendor statuses when there is one vendor', async function () {
            let vendors = ['vendor1'];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const allVendors = await vendorRepositorySpy.list();
            expect(vendorStatusRepositorySpy.ensuredStatusVendors).deep.equals(allVendors);
            expect(vendorStatusRepositorySpy.resetStatusVendors).deep.equals(allVendors);
        });

        it('resets vendor statuses when there is more than one vendor', async function () {
            let vendors = ['vendor1', 'vendor2'];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const allVendors = await vendorRepositorySpy.list();
            expect(vendorStatusRepositorySpy.ensuredStatusVendors).deep.equals(allVendors);
            expect(vendorStatusRepositorySpy.resetStatusVendors).deep.equals(allVendors);
        });

        it('sets the cycle property on the vendor statuses', async function() {
            let vendors = ['vendor1', 'vendor2', 'vendor3'];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const statuses = vendorStatusRepositorySpy.vendorStatuses;
            Object.keys(statuses).forEach(vendorId => {
                const status = statuses[vendorId];

                expect(status.cycle).equals(testCycleCreationJob.targetCycle);
            });
        });

        // need to persist the changes to the vendor status to the repository
    });

    describe(`transformProducts function`,  () => {

        it('calls transformProducts', async function () {

            testCycleCreationJob.loadCycles = 'filler';
            testCycleCreationJob.replicate = 'filler';
            testCycleCreationJob.indexViews = 'filler';
            testCycleCreationJob.resetVendorStatus = 'filler';
            testCycleCreationJob.resetLibraryStatus = 'filler';
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(productRepositorySpy.transformProductsCalled).to.equal(1);
        });
    });

    describe(`transformOfferings function`, () => {

        it('calls transformOfferings', async function () {
            testCycleCreationJob.loadCycles = 'filler';
            testCycleCreationJob.replicate = 'filler';
            testCycleCreationJob.indexViews = 'filler';
            testCycleCreationJob.resetVendorStatus = 'filler';
            testCycleCreationJob.resetLibraryStatus = 'filler';
            testCycleCreationJob.transformProducts = 'filler';
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(offeringRepositorySpy.transformOfferingsCalled).to.equal(1);
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
                id: cycleID,
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

function createProductRepositorySpy() {
    return {
        transformProductsCalled: 0,

        transformProductsForNewCycle: function (newCycle) {
            this.transformProductsCalled++;
        }
    };
}

function createOfferingRepositorySpy() {
    return {
        transformOfferingsCalled: 0,

        transformOfferingsForNewCycle: function (newCycle, sourceCycle) {
            this.transformOfferingsCalled++;
        }
    };
}

function createVendorRepository() {
    let vendors = [];
    return {
        list: function () {
            return vendors;
        },
        setVendors: function (newVendors) {
            vendors = newVendors;
        },
    };
}

function createVendorStatusRepository() {

    const ensuredStatusVendors = [];
    const resetStatusVendors = [];

    const vendorStatuses = {};

    return {
        ensuredStatusVendors,
        resetStatusVendors,
        vendorStatuses,
        ensureStatusExistsForVendor: async function(vendorId, newCycle) {
            ensuredStatusVendors.push(vendorId);
        },
        getStatusForVendor: async function(vendorId, newCycle) {
            if(!vendorStatuses[vendorId]) {
                vendorStatuses[vendorId] = {
                    vendor: vendorId
                };
            }

            return vendorStatuses[vendorId];
        },
        reset: function(vendorStatus, newCycle) {
            resetStatusVendors.push(vendorStatus.vendor);
            return vendorStatus;
        }
    };
}

function createFakeTimestamper(expectedTimestamp) {
    return {
        getCurrentTimestamp: function () {
            return expectedTimestamp;
        }
    }
}
