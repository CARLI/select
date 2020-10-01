var chai = require('chai');
var expect = chai.expect;
var Q = require('q');
var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

describe('The Cycle Creation Job Process', function(){
    let couchUtilsSpy;
    let testCycleCreationJob;
    let cycleRepository;
    let productRepositorySpy;
    let offeringRepositorySpy;
    let vendorRepositorySpy;
    let libraryRepositorySpy;
    let cycleCreationJobProcessor;
    let vendorStatusRepositorySpy;
    let libraryStatusRepositorySpy;


    beforeEach(function() {
        let fakeTimestamper = createFakeTimestamper('2020-08-22-19:34:21Z');
        couchUtilsSpy = createCouchUtilsSpy();
        testCycleCreationJob = createTestCycleCreationJob();
        cycleRepository = createCycleRepository();
        productRepositorySpy = createProductRepositorySpy();
        offeringRepositorySpy = createOfferingRepositorySpy();
        vendorRepositorySpy = createVendorRepository();
        libraryRepositorySpy = createLibraryRepository();
        vendorStatusRepositorySpy = createVendorStatusRepository();
        libraryStatusRepositorySpy = createLibraryStatusRepository();
        cycleCreationJobProcessor = CycleCreationJobProcessor({
            cycleRepository: cycleRepository,
            couchUtils: couchUtilsSpy,
            timestamper: fakeTimestamper,
            productRepository: productRepositorySpy,
            offeringRepository: offeringRepositorySpy,
            vendorRepository: vendorRepositorySpy,
            libraryRepository: libraryRepositorySpy,
            libraryStatusRepository: libraryStatusRepositorySpy,
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

        it(`is not finished if progress is less than 100 percent`, async () => {
            const couchJobsPromise = Q([
                {type: 'indexer', progress: 100, database: 'cycle-0'},
            ]);

            sourceCycle.cycleType = "Alternative Cycle";

            couchUtilsSpy.getRunningCouchJobs = () => couchJobsPromise;
            await cycleCreationJobProcessor._waitForIndexingToFinish(sourceCycle);
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
            let vendors = [ { id: 'vendor1' } ];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const allVendors = await vendorRepositorySpy.list();
            const allVendorIds = allVendors.map(vendor => vendor.id);
            expect(vendorStatusRepositorySpy.ensuredStatusVendors).deep.equals(allVendorIds);
            expect(vendorStatusRepositorySpy.resetStatusVendors).deep.equals(allVendorIds);
        });

        it('resets vendor statuses when there is more than one vendor', async function () {
            let vendors = [ { id: 'vendor1' }, { id: 'vendor2' } ];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const allVendors = await vendorRepositorySpy.list();
            const allVendorIds = allVendors.map(vendor => vendor.id);
            expect(vendorStatusRepositorySpy.ensuredStatusVendors).deep.equals(allVendorIds);
            expect(vendorStatusRepositorySpy.resetStatusVendors).deep.equals(allVendorIds);
        });

        it('sets the cycle property on the vendor statuses', async function() {
            let vendors = [ { id: 'vendor1' }, { id: 'vendor2' }, { id: 'vendor3'} ];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const statuses = vendorStatusRepositorySpy.vendorStatuses;
            Object.keys(statuses).forEach(vendorId => {
                const status = statuses[vendorId];

                expect(status.cycle).equals(testCycleCreationJob.targetCycle);
            });
        });

        it('needs to persist the changes to the vendor status to the repository', async function() {
            let vendors = [ { id: 'vendor1' }, { id: 'vendor2' }, { id: 'vendor3'} ];
            vendorRepositorySpy.setVendors(vendors);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(vendorStatusRepositorySpy.statusesUpdated).deep.equals(vendors.map(vendor => vendor.id));
        });
    });

    describe(`resetLibraryStatus function`, () => {

        let newCycle;

        beforeEach(async () => {
            newCycle = await cycleRepository.load('1');
            testCycleCreationJob.loadCycles = 'filler';
            testCycleCreationJob.replicate = 'filler';
            testCycleCreationJob.indexViews = 'filler';
            testCycleCreationJob.resetVendorStatus = 'filler';
        });

        it('calls resetLibraryStatus', async function () {
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.logMessage).equals('Ensuring all libraries have statuses for ' + newCycle.databaseName);
        });

        it('resets library statuses when there is one library', async function () {
            let libraries = [ { id: 'lib1' } ];
            libraryRepositorySpy.setLibraries(libraries);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const allLibraries = await libraryRepositorySpy.list();
            const allLibraryIds = allLibraries.map(library => library.id);
            expect(libraryStatusRepositorySpy.ensuredStatusLibraries).deep.equals(allLibraryIds);
            expect(libraryStatusRepositorySpy.resetStatusLibraries).deep.equals(allLibraryIds);
        });

        it('resets library statuses when there is more than one library', async function () {
            let libraries = [ { id: 'lib1' }, { id: 'lib2' } ];
            libraryRepositorySpy.setLibraries(libraries);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const allLibraries = await libraryRepositorySpy.list();
            const allLibraryIds = allLibraries.map(library => library.id);
            expect(libraryStatusRepositorySpy.ensuredStatusLibraries).deep.equals(allLibraryIds);
            expect(libraryStatusRepositorySpy.resetStatusLibraries).deep.equals(allLibraryIds);
        });

        it('sets the cycle property on the library statuses', async function() {
            let libraries = [ { id: 'lib1' }, { id: 'lib2' }, { id: 'lib3' } ];
            libraryRepositorySpy.setLibraries(libraries);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            const statuses = libraryStatusRepositorySpy.libraryStatuses;
            Object.keys(statuses).forEach(libraryId => {
                const status = statuses[libraryId];

                expect(status.cycle).equals(testCycleCreationJob.targetCycle);
            });
        });

        it('needs to persist the changes to the library status to the repository', async function() {
            let libraries = [ { id: 'lib1' }, { id: 'lib2' }, { id: 'lib3' } ];
            libraryRepositorySpy.setLibraries(libraries);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(libraryStatusRepositorySpy.statusesUpdated).deep.equals(libraries.map(library => library.id));
        });
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

    describe(`setCycleToNextPhase function`, () => {

        beforeEach(function() {
            testCycleCreationJob.loadCycles = 'filler';
            testCycleCreationJob.replicate = 'filler';
            testCycleCreationJob.indexViews = 'filler';
            testCycleCreationJob.resetVendorStatus = 'filler';
            testCycleCreationJob.resetLibraryStatus = 'filler';
            testCycleCreationJob.transformProducts = 'filler';
            testCycleCreationJob.transformOfferings = 'filler';
            testCycleCreationJob.indexViewsPhase2 = 'filler';
        });

        it('calls setCycleToNextPhase', async function () {
            await cycleCreationJobProcessor.process(testCycleCreationJob);
        });

        it('should proceed cycle to the next step', async function () {
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.cyclesAtNextStep[0]).to.equal(testCycleCreationJob.targetCycle);
        });

        it('should update the new cycle', async function () {
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(cycleRepository.cyclesUpdated[0]).to.equal(testCycleCreationJob.targetCycle);
        });

        it('should error on invalid cycle update', async function () {
            let logMessage = "";
            global.Logger = {
                log: function (message) {
                    logMessage = message;
                }
            };
            cycleRepository.update = function () {
                throw new Error();
            }
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(logMessage).to.equal('Failed state transition: ');
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
        },
        getRunningCouchJobs: async function () {
            return [];
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
    const cyclesAtNextStep = [];
    const cyclesLoaded = [];
    const cyclesUpdated = [];

    return {
        cyclesLoaded,
        cyclesAtNextStep,
        cyclesUpdated,
        logMessage: '',
        load: function (cycleID) {
            cyclesLoaded.push(cycleID);
            return Q({
                id: cycleID,
                getDatabaseName: () => {
                    return 'cycle-' + cycleID;
                },
                proceedToNextStep: () => {
                    cyclesAtNextStep.push(cycleID);
                }
            });

        },
        createCycleLog: function (message) {
            this.logMessage = message;
        },
        update: async (cycle) => {
            cyclesUpdated.push(cycle.id);
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

function createLibraryRepository() {
    let libraries = [];
    return {
        list: function () {
            return libraries;
        },
        setLibraries: function (newLibraries) {
            libraries = newLibraries;
        },
    };
}

function createVendorStatusRepository() {

    const ensuredStatusVendors = [];
    const resetStatusVendors = [];

    const vendorStatuses = {};

    const statusesUpdated = [];

    return {
        ensuredStatusVendors,
        resetStatusVendors,
        vendorStatuses,
        statusesUpdated,
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
        },
        update: function (resetStatus, newCycle) {
            statusesUpdated.push(resetStatus.vendor);
        }
    };
}

function createLibraryStatusRepository() {

    const ensuredStatusLibraries = [];

    const resetStatusLibraries = [];

    const libraryStatuses = {};

    const statusesUpdated = [];

    return {
        ensuredStatusLibraries,
        resetStatusLibraries,
        libraryStatuses,
        statusesUpdated,
        ensureLibraryStatus: async function(libraryId, newCycle) {
            ensuredStatusLibraries.push(libraryId);
        },
        getStatusForLibrary: async function(libraryId, newCycle) {
            if(!libraryStatuses[libraryId]) {
                libraryStatuses[libraryId] = {
                    library: libraryId
                };
            }
            return libraryStatuses[libraryId];
        },
        reset: function(libraryStatus, newCycle) {
            resetStatusLibraries.push(libraryStatus.library);
            return libraryStatus;
        },
        update: function (resetStatus, newCycle) {
            statusesUpdated.push(resetStatus.library);
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
