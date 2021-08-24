var chai = require('chai');
var expect = chai.expect;
var Q = require('q');
var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

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
let cycleCreationJobRepositorySpy;

describe('The Cycle Creation Job Process', function(){
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
        cycleCreationJobRepositorySpy = createCycleCreationJobRepository();
        cycleCreationJobProcessor = CycleCreationJobProcessor({
            cycleRepository: cycleRepository,
            couchUtils: couchUtilsSpy,
            timestamper: fakeTimestamper,
            productRepository: productRepositorySpy,
            offeringRepository: offeringRepositorySpy,
            vendorRepository: vendorRepositorySpy,
            libraryRepository: libraryRepositorySpy,
            libraryStatusRepository: libraryStatusRepositorySpy,
            vendorStatusRepository: vendorStatusRepositorySpy,
            cycleCreationJobRepository: cycleCreationJobRepositorySpy
        });
    });

    describe('the process method', function() {
        it(`marks the step completed when finished`, async () => {
            testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';

            await cycleCreationJobProcessor.process(testCycleCreationJob);
            expect(await cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob.id))
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

        //TODO new test - to ensure indexing is properly being waited on to finish
        it.skip('should return proper waiting for indexing messsaging', async function () {

            let sourceCycle = await cycleRepository.load('2');
            sourceCycle.cycleType = "Alternative Cycle";

            testCycleCreationJob.loadCycles = '2020-09-09-20:01:34';
            testCycleCreationJob.replicate = '2020-09-09-20:01:34';

            const couchJobsPromise = Q([
                {type: 'indexer', progress: 100, database: 'cycle-cycle2'},
            ]);

            couchUtilsSpy.getRunningCouchJobs = () => couchJobsPromise;

            const result = await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(result.result).to.equal('Waiting for cycle2 indexing');

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
        it('sets the time of completion to the current time for the given step', async function() {
            await cycleCreationJobProcessor._markStepCompleted(testCycleCreationJob, 'test');
            expect(testCycleCreationJob.test).equals('2020-08-22-19:34:21Z');
        });

        it(`persists the changes to the job entity`, async () => {
            await cycleCreationJobProcessor._markStepCompleted(testCycleCreationJob, 'test');
            expect(cycleCreationJobRepositorySpy.updateCalled).to.be.true;
        });

        it(`marks the job complete when the last step finishes`, async () => {
            const stepOrder = cycleCreationJobProcessor._steps;
            for(let step in stepOrder) {
                await cycleCreationJobProcessor._markStepCompleted(testCycleCreationJob, stepOrder[step]);
            }

            expect(testCycleCreationJob.completed).equals(true);
        });
    });

    describe(`markJobRunning function`, () => {
        it(`marks the job running`, async () => {
            expect(testCycleCreationJob.running).not.equals(true);

            await cycleCreationJobProcessor._markJobRunning(0);

            expect(testCycleCreationJob.running).equals(true);
        });
    });

    describe(`markJobStopped function`, () => {
        it(`marks the job stopped`, async () => {
            await cycleCreationJobProcessor._markJobRunning(0);
            expect(testCycleCreationJob.running).equals(true);

            await cycleCreationJobProcessor._markJobStopped(0);
            expect(testCycleCreationJob.running).not.equals(true);
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

        //TODO need to add more tests for more variations.
        // - Test with other cycle types (calendar & fiscal)
        // - Clarify special case for Alternative Cycles
        // - Add more tests for different % completed
        it('', async () => {

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

    describe(`removeDuplicateOfferings function`, () => {
        let newCycle;

        beforeEach(async () => {
            newCycle = await cycleRepository.load('1');
            testCycleCreationJob.loadCycles = 'filler';
            testCycleCreationJob.replicate = 'filler';
            testCycleCreationJob.indexViews = 'filler';
            testCycleCreationJob.resetVendorStatus = 'filler';
            testCycleCreationJob.resetLibraryStatus = 'filler';
            testCycleCreationJob.transformProducts = 'filler';
        });

        it('calls removeDuplicateOfferings', async function () {
            await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(cycleRepository.logMessage).equals('Removing duplicate offerings for ' + newCycle.databaseName);
        });

        it(`removes nothing if there are no offerings`, async function () {
            let stepResult = await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(stepResult).to.deep.equal({ succeeded: true, result: []});
        });

        it(`removes nothing if there are no duplicates`, async function () {
            offeringRepositorySpy.setOfferings([
                {
                    display: '',
                    id: 'keep',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: []
                    },
                    product: 1
                }, {
                    display: '',
                    id: 'keep',
                    library: 1,
                    pricing: {
                        site: 1,
                        su: []
                    },
                    product: 2
                }]);
            let stepResult = await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(stepResult).to.deep.equal({ succeeded: true, result: []});
            expect(offeringRepositorySpy.deleteCalled).equals(0);
        });

        it(`removes a duplicate with no pricing`, async function () {
            offeringRepositorySpy.setOfferings([
                {
                    display: '',
                    id: 'keep',
                    library: 1,
                    pricing: {
                        site: 1,
                        su: []
                    },
                    product: 1,
                },
                {
                    display: '',
                    id: 'remove',
                    library: 1,
                    product: 1
                }]);

            let stepResult = await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(stepResult.result.length).equals(1);
            expect(stepResult.result[0]).equals('remove');
            expect(offeringRepositorySpy.deleteCalled).equals(1);
            expect(offeringRepositorySpy.lastDeleteArgs).deep.equals({
                offeringId: 'remove',
                cycleId: 'cycle2'
            })
        });

        it(`removes a duplicate with 0 site price and empty su pricing`, async function () {
            offeringRepositorySpy.setOfferings([
                {
                    display: '',
                    id: 'keep',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: [1]
                    },
                    product: 1,
                },
                {
                    display: '',
                    id: 'remove',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: []
                    },
                    product: 1
                }]);

            let stepResult = await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(stepResult.result.length).equals(1);
            expect(stepResult.result[0]).equals('remove');
            expect(offeringRepositorySpy.deleteCalled).equals(1);
            expect(offeringRepositorySpy.lastDeleteArgs).deep.equals({
                offeringId: 'remove',
                cycleId: 'cycle2'
            })
        });

        it(`removes duplicates for multiple products`, async function () {
            offeringRepositorySpy.setOfferings([
                {
                    display: '',
                    id: 'keep1',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: [1]
                    },
                    product: 1,
                },
                {
                    display: '',
                    id: 'keep2',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: [1]
                    },
                    product: 2,
                },
                {
                    display: '',
                    id: 'remove1',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: []
                    },
                    product: 1
                },
                {
                    display: '',
                    id: 'remove2',
                    library: 1,
                    pricing: {
                        site: 0,
                        su: []
                    },
                    product: 2
                }]);

            let stepResult = await cycleCreationJobProcessor.process(testCycleCreationJob);

            expect(stepResult.result.length).equals(2);
            expect(stepResult.result).to.deep.equal(['remove1', 'remove2']);
            expect(offeringRepositorySpy.deleteCalled).equals(2);
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
            testCycleCreationJob.removeDuplicateOfferings = 'filler';
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
        deleteCalled: 0,
        lastDeleteArgs: {},
        unexpandedOfferings: [],
        transformOfferingsCalled: 0,

        delete(offeringId, cycle) {
            this.deleteCalled++;
            this.lastDeleteArgs = { offeringId: offeringId, cycleId: cycle.id };
        },

        listOfferingsUnexpanded(cycle) {
            return this.unexpandedOfferings;
        },

        setOfferings: function (newOfferings) {
            this.unexpandedOfferings = newOfferings;
        },

        transformOfferingsForNewCycle: function (newCycle, sourceCycle) {
            this.transformOfferingsCalled++;
        },
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

function createCycleCreationJobRepository() {
    return {
        updateCalled: false,
        load: function() {
            return testCycleCreationJob;
        },
        update: function() {
            this.updateCalled = true;
        }
    };
}
