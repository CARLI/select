var chai = require('chai');
var expect = chai.expect;
const couchUtils = require('../Store/CouchDb/Utils')();
const cycleRepository = require('../Entity/CycleRepository');
const offeringRepository = require('../Entity/OfferingRepository');
const productRepository = require('../Entity/ProductRepository');
const testUtils = require('./utils');
const vendorRepository = require('../Entity/VendorRepository');
const libraryRepository = require('../Entity/LibraryRepository');
const libraryStatusRepository = require('../Entity/LibraryStatusRepository');
const vendorStatusRepository = require('../Entity/VendorStatusRepository');
const cycleCreationJobRepository = require('../Entity/CycleCreationJobRepository');
var entityTransform = require('../Entity/EntityTransformationUtils.js');
var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');
var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');

testUtils.setupTestDb();
entityTransform.setEntityLookupStores(testUtils.getTestDbStore());

cycleRepository.setStore(testUtils.getTestDbStore());
offeringRepository.setStore(testUtils.getTestDbStore());
productRepository.setStore(testUtils.getTestDbStore());
vendorRepository.setStore(testUtils.getTestDbStore());
libraryRepository.setStore(testUtils.getTestDbStore());
libraryStatusRepository.setStore(testUtils.getTestDbStore());
vendorStatusRepository.setStore(testUtils.getTestDbStore());
cycleCreationJobRepository.setStore(testUtils.getTestDbStore());

let product1;
let product2;
let offering1;
let offering2;
let offering3;
let offering4;

const testCycle = {
    id: testUtils.testDbMarker + '-cycle1',
    name: testUtils.testDbMarker + 'cycle creation job test cycle1',
    cycleType: 'Calendar Year',
    year: 3001,
    status: 5,
    isArchived: false,
}

const testCycle2 = {
    id: testUtils.testDbMarker + '-cycle2',
    name: testUtils.testDbMarker + 'cycle creation job test cycle2',
    cycleType: 'Calendar Year',
    year: 3002,
    status: 0,
    isArchived: false,
}

var testCycleCreationJob = createTestCycleCreationJob();
const timestamper = {
    getCurrentTimestamp: function () {
        return new Date().toISOString();
    }
}


describe('Integration Test for a Cycle Creation Job Processor', function () {

    before(async function() {

        this.timeout(30000);

        const jobId = await cycleCreationJobRepository.create(testCycleCreationJob);
        testCycleCreationJob = await cycleCreationJobRepository.load(jobId);

        const processorParams = {
            cycleRepository,
            couchUtils,
            timestamper,
            productRepository,
            offeringRepository,
            vendorRepository,
            libraryRepository,
            libraryStatusRepository,
            vendorStatusRepository,
            cycleCreationJobRepository
        }

        const cycleCreationJobProcessor = CycleCreationJobProcessor(processorParams);

        await populateRepositories();
        await cycleCreationJobProcessor.initializeNewCycle(testCycle2);


        while(await cycleCreationJobProcessor._getCurrentStepForJob(jobId) !== "done") {
            const currentStep = await cycleCreationJobProcessor._getCurrentStepForJob(jobId);
            console.log("[START]: " + currentStep);
            await cycleCreationJobProcessor.process(jobId);
            console.log("[END]: " + currentStep);
        }
    });

    it('Should reset vendor statuses', async function (){

        const resetVendor = {
            cycle: testCycle2.id,
            type: 'VendorStatus',
            lastActivity: null,
            description: 'No Activity',
            isClosed: false,
            flaggedOfferingsCount: 0,
            flaggedOfferingsReasons: {},
            progress: 0,
            checklist: {
                siteLicense: false,
                simultaneousUsers: false,
                descriptions: false,
            }
        };

        const cycle = await cycleRepository.load(testCycle2.id);
        const vendorStatuses = await vendorStatusRepository.list(cycle);
        expect(vendorStatuses.length).equals(2);
        vendorStatuses.forEach(vendorStatus => {
            const clone = Object.assign({}, vendorStatus);

            delete clone._id;
            delete clone.id;
            delete clone._rev;
            delete clone.vendor;

            expect(clone).deep.equals(resetVendor);
        });
    });

    it('Should reset library statuses', async function (){
        const resetLibraryStatus = {
            lastActivity: "",
            cycle: testCycle2.id,
            description: '',
            isComplete: false,
            type: "LibraryStatus"
        };

        const cycle = await cycleRepository.load(testCycle2.id);
        const libraryStatuses = await libraryStatusRepository.list(cycle);

        // this magic number is from the actual CRM DB library count
        expect(libraryStatuses.length).equals(188);
        libraryStatuses.forEach(libraryStatus => {
            const clone = Object.assign({}, libraryStatus);

            delete clone._id;
            delete clone.id;
            delete clone._rev;
            delete clone.library;

            expect(clone).deep.equals(resetLibraryStatus);
        });
    });

    it(`should have the readonly-staff role on all databases for the new cycle`, async function () {
        const cycle = await cycleRepository.load(testCycle2.id);
        const cycleDatabases = await cycleRepository.listAllDatabaseNamesForCycle(cycle);
        for(let databaseName in cycleDatabases) {
            const securityDocument = await couchUtils.getSecurityDocument(databaseName);
            const readonlyRole = securityDocument.members.roles.find(role => role === 'readonly-staff');
            expect(readonlyRole).to.not.be.undefined;
        }
    });

    it('Should transform products', async function (){
        const targetCycle = await cycleRepository.load(testCycle2.id);
        const targetProducts = await productRepository.list(targetCycle);

        expectCycleUpdated();
        expectPriceCapsUpdated();
        expectVendorCommentsRemoved();

        function expectCycleUpdated() {
            targetProducts.forEach(product => {
                expect(product.cycle.id).equals(testCycle2.id);
            });
        }

        function expectPriceCapsUpdated() {
            const transformedProduct1 = targetProducts.find(product => product.id === product1.id);
            expect(transformedProduct1.priceCap).equals(5);
            expect(transformedProduct1.futurePriceCaps).deep.equals(product1.futurePriceCaps);

            const transformedProduct2 = targetProducts.find(product => product.id === product2.id);
            expect(transformedProduct2.priceCap).equals(20);
            expect(transformedProduct2.futurePriceCaps).deep.equals({});
        }

        function expectVendorCommentsRemoved() {
            targetProducts.forEach(product => {
                expect(product.comments).equals('');
            });
        }
    });

    it('Should transform offerings', async function (){
        const targetCycle = await cycleRepository.load(testCycle2.id);
        const targetOfferings = await offeringRepository.list(targetCycle);

        expectCycleIdIsUpdated();
        expectOfferingHistoryIsUpdated();
        expectVendorTrackingIsRemoved();
        expectSelectionRemoved();
        expectFlaggedStateIsReset();
        expectCommentsCleared();

        function expectCycleIdIsUpdated() {
            targetOfferings.forEach(offering => {
                expect(offering.cycle.id).equals(targetCycle.id);
            });
        }

        function expectOfferingHistoryIsUpdated() {
            const newOffering4 = targetOfferings.find(offering => offering.id === offering4.id);
            const otherOfferings = targetOfferings.filter(offering => offering.id !== offering4.id);

            // if there's a selection, that should also get copied in
            expect(newOffering4.history[testCycle.year].selection).to.be.undefined;
            otherOfferings.forEach(offering => {
                expect(offering.history[testCycle.year].selection).to.not.be.undefined;
            });

            // make sure the pricing and funding gets copied into the history
            expect(newOffering4.history[testCycle.year].pricing).to.deep.equal(offering4.pricing);
            expect(newOffering4.history[testCycle.year].funding).to.deep.equal(offering4.funding);

            otherOfferings.forEach(offering => {
                expect(offering.history[testCycle.year].pricing).to.not.be.undefined;
                expect(offering.history[testCycle.year].funding).to.be.undefined;
            });
        }

        function expectVendorTrackingIsRemoved() {
            targetOfferings.forEach(offering => {
                expect(offering.siteLicensePriceUpdated).to.be.undefined;
                expect(offering.suPricesUpdated).to.be.undefined;
            });
        }

        function expectSelectionRemoved() {
            targetOfferings.forEach(offering => {
                expect(offering.selection).to.be.undefined;
            });
        }

        function expectFlaggedStateIsReset() {
            targetOfferings.forEach(offering => {
                expect(offering.flagged).to.be.undefined;
                expect(offering.flaggedReason).to.be.undefined;
            });
        }

        function expectCommentsCleared() {
            targetOfferings.forEach(offering => {
                expect(offering.libraryComments).equals('');
                expect(offering.vendorComments).deep.equals({
                    site: '',
                    su: []
                });
            });
        }
    });

    it('Should set a cycle to the next phase', async function (){
        const targetCycle = await cycleRepository.load(testCycle2.id)
        expect(targetCycle.status).equals(cycleRepository.CYCLE_STATUS_EDITING_PRODUCT_LIST);
    });
});

function createTestCycleCreationJob() {
    return {
        type: 'CycleCreationJob',
        sourceCycle: testCycle.id,
        targetCycle: testCycle2.id
    };
}

function populateRepositories() {

    return populateCycleRepository()
        .then(populateVendorRepository)
        .then(populateProductRepository)
        .then(populateOfferingRepository)
        .then(populateVendorStatusRepository)
        .catch(err => {
            console.log('Error creating test data: ', err);
        })
}


function populateCycleRepository() {
    return cycleRepository.create(testCycle);
}

async function populateProductRepository() {

    product1 = {
        id: 'product1',
        name: 'Product1',
        cycle: testCycle.id,
        vendor: 'vendor1',
        description: 'A fake product number one',
        comments: 'Test comment',
        priceCap: 5,
        futurePriceCaps: {
            10: 10
        }
    };
    product2 = {
        id: 'product2',
        name: 'Product2',
        cycle: testCycle.id,
        vendor: 'vendor1',
        description: 'A fake product number two',
        futurePriceCaps: {
            3002: 20
        }
    };

    let cycle = await cycleRepository.load(testCycle.id);

    return productRepository.create(product1, cycle)
        .then(() => productRepository.create(product2, cycle))
}

async function populateVendorRepository() {
    const vendor1 = {
        id: 'vendor1',
        name: 'Vendor1'
    };

    const vendor2 = {
        id: 'vendor2',
        name: 'Vendor2'
    };

    await vendorRepository.create(vendor1);
    const cycleRepo = cycleRepositoryForVendor(vendor1);
    await cycleRepo.createDatabase(testCycle.id);

    await vendorRepository.create(vendor2);
    const cycleRepo2 = cycleRepositoryForVendor(vendor2);
    await cycleRepo2.createDatabase(testCycle.id);
}

async function populateOfferingRepository() {
    //Product 1 and 2 for Library 1
    offering1 = {
        id: 'offering1',
        cycle: testCycle.id,
        library: '1',
        product: 'product1',
        vendor: 'vendor1',
        display: 'with-price',
        internalComments: '',
        pricing: {
            site: 10000,
            su: [
                {users: 1, price: 1000},
                {users: 2, price: 2000},
                {users: 3, price: 3000}
            ]
        },
        selection: {
            users: 1,
            datePurchased: '2020-05-01'
        },
        siteLicensePriceUpdated: '2020-01-01',
        suPricesUpdated: '2020-01-01'
    };
    offering2 = {
        id: 'offering2',
        cycle: testCycle.id,
        library: '1',
        product: 'product2',
        vendor: 'vendor1',
        display: 'with-price',
        internalComments: '',
        pricing: {
            site: 5000,
            su: [
                {users: 1, price: 500},
                {users: 2, price: 1000},
                {users: 3, price: 1500}
            ]
        },
        selection: {
            users: 1,
            datePurchased: '2020-05-01'
        },
        siteLicensePriceUpdated: '2020-01-01',
        suPricesUpdated: '2020-01-01'
    }

    //Product 1 and 2 for Library 2
    offering3 = {
        id: 'offering3',
        cycle: testCycle.id,
        library: '2',
        product: 'product1',
        vendor: 'vendor1',
        display: 'with-price',
        internalComments: '',
        pricing: {
            site: 10000,
            su: [
                {users: 1, price: 1000},
                {users: 2, price: 2000},
                {users: 3, price: 3000}
            ]
        },
        selection: {
            users: 1,
            datePurchased: '2020-05-01'
        },
        siteLicensePriceUpdated: '2020-01-01',
        suPricesUpdated: '2020-01-01'
    };
    offering4 = {
        id: 'offering4',
        cycle: testCycle.id,
        library: '2',
        product: 'product2',
        vendor: 'vendor1',
        display: 'with-price',
        internalComments: '',
        pricing: {
            site: 5000,
            su: [
                {users: 1, price: 500},
                {users: 2, price: 1000},
                {users: 3, price: 1500}
            ]
        },
        funding: {
            fundedByPercentage: true,
            fundedPercent: 50
        },
        flagged: true,
        flaggedReason: [ "Test reason", "Test Reason 2" ],
        siteLicensePriceUpdated: '2020-01-01',
        suPricesUpdated: '2020-01-01'
    }

    let cycle = await cycleRepository.load(testCycle.id);

    return offeringRepository.create(offering1, cycle)
        .then(() => offeringRepository.create(offering2, cycle))
        .then(() => offeringRepository.create(offering3, cycle))
        .then(() => offeringRepository.create(offering4, cycle))
}

async function populateVendorStatusRepository() {
    var testVendorStatus1 = {
        vendor: 'vendor1',
        cycle: testCycle.id,
        lastActivity: '', //a fake timestamp
        description: 'Some Activity',
        isClosed: true,
        flaggedOfferingsCount: 1,
        flaggedOfferingsReasons: {},
        progress: 1,
        checklist: {
            siteLicense: true,
            simultaneousUsers: true,
            descriptions: true
        }
    };
    var testVendorStatus2 = {
        vendor: 'vendor2',
        cycle: testCycle.id,
        lastActivity: '', //a fake timestamp
        description: 'Some Activity',
        isClosed: true,
        flaggedOfferingsCount: 2,
        flaggedOfferingsReasons: {},
        progress: 2,
        checklist: {
            siteLicense: true,
            simultaneousUsers: true,
            descriptions: true
        }
    };

    let cycle = await cycleRepository.load(testCycle.id);
    return vendorStatusRepository.create(testVendorStatus1, cycle)
        .then(() => vendorStatusRepository.create(testVendorStatus2, cycle));
}