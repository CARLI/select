const couchUtils = require('../Store/CouchDb/Utils')();
const cycleRepository = require('../Entity/CycleRepository');
const offeringRepository = require('../Entity/OfferingRepository');
const productRepository = require('../Entity/ProductRepository');
var cycleRepositoryForVendor = require('../../CARLI/Entity/CycleRepositoryForVendor');
const testUtils = require('./utils');
const vendorRepository = require('../Entity/VendorRepository');
const libraryRepository = require('../Entity/LibraryRepository');
const libraryStatusRepository = require('../Entity/LibraryStatusRepository');
const vendorStatusRepository = require('../Entity/VendorStatusRepository');
var entityTransform = require('../Entity/EntityTransformationUtils.js');
var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

testUtils.setupTestDb();
entityTransform.setEntityLookupStores(testUtils.getTestDbStore());

cycleRepository.setStore(testUtils.getTestDbStore());
offeringRepository.setStore(testUtils.getTestDbStore());
productRepository.setStore(testUtils.getTestDbStore());
vendorRepository.setStore(testUtils.getTestDbStore());
libraryRepository.setStore(testUtils.getTestDbStore());
libraryStatusRepository.setStore(testUtils.getTestDbStore());
vendorStatusRepository.setStore(testUtils.getTestDbStore());

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

describe.only('Integration Test for a Cycle Creation Job Processor', function () {

    it('runs a complete cycle creation process', async function() {
        this.timeout(30000);

        const processorParams = {
            cycleRepository,
            couchUtils,
            timestamper,
            productRepository,
            offeringRepository,
            vendorRepository,
            libraryRepository,
            libraryStatusRepository,
            vendorStatusRepository
        }

        const cycleCreationJobProcessor = CycleCreationJobProcessor(processorParams);

        await populateRepositories();
        await cycleCreationJobProcessor.initializeNewCycle(testCycle2);

        while(cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob) !== "done") {
            const currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            console.log("[START]: " + currentStep);
            await cycleCreationJobProcessor.process(testCycleCreationJob);
            console.log("[END]: " + currentStep);
        }

        /*
        Test:
        Vendor Statuses are reset,
        Library Statuses are reset,
        Products are transformed,
        Offerings are transformed,
        Cycle is set to next phase
        */

        /*
        ASSERTIONS

        ** The two vendor statuses got copied

        ** Vendor statuses look like:
        vendorStatus.lastActivity = null;
        vendorStatus.description = 'No Activity';
        vendorStatus.isClosed = false;
        vendorStatus.flaggedOfferingsCount = 0;
        vendorStatus.flaggedOfferingsReasons = {};
        vendorStatus.progress = 0;
        vendorStatus.checklist = {
        siteLicense: false,
        simultaneousUsers: false,
        descriptions: false

        ** The two library statuses got copied to the target cycle

        ** Library Statuses look like:
        lastActivity = null;
        description = '';
        isComplete = false;


        ** Products got copied to target cycle

        ** Products got "transformed"
        set product's cycle to be the target cycle
        copies price caps (make sure test data has future price caps)
        make sure current price cap is the previous future price cap for the cycle's year
        make sure future price cap does not have an entry for current year
        remove vendor comments


        ** Offerings got copied to target cycle

        ** Offerings got reset
        offering.cycle == target cycle id
        copy history (pricing, funding, and selection) <----- !!! (there are a few things hiding in here, will want to check the old offering)
        delete offering.siteLicensePriceUpdated;
        delete offering.suPricesUpdated;
        delete offering.selection
        delete offering.flag
        delete offering.flaggedReason;
        offering.libraryComments = '';
        offering.vendorComments = {
            site: '',
            su: []
        };


        ** Load the target cycle, confirm it has the expected status
        targetCycle.status == cycleRespository.CYCLE_STATUS_EDITING_PRODUCT_LIST
        * */
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
        .then(populateLibraryStatusRepository)
        .catch(err => {
            console.log('Error creating test data: ', err);
        })
}


function populateCycleRepository() {
    return cycleRepository.create(testCycle);
}

async function populateProductRepository() {

    const product1 = {
        id: 'product1',
        name: 'Product1',
        cycle: testCycle.id,
        vendor: 'vendor1',
        description: 'A fake product number one'
    };
    const product2 = {
        id: 'product2',
        name: 'Product2',
        cycle: testCycle.id,
        vendor: 'vendor1',
        description: 'A fake product number two'
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

    await vendorRepository.create(vendor1);
    const cycleRepo = cycleRepositoryForVendor(vendor1);
    await cycleRepo.createDatabase(testCycle.id);
}

async function populateOfferingRepository() {
    //Product 1 and 2 for Library 1
    const offering1 = {
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
    const offering2 = {
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
    const offering3 = {
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
    const offering4 = {
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
        selection: {
            users: 1,
            datePurchased: '2020-05-01'
        },
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

async function populateLibraryStatusRepository() {

    var testLibraryStatus1 = {
        library: '1',
        cycle: testCycle.id,
        lastActivity: null,
        description: 'some desc',
        isComplete: true,
    };

    var testLibraryStatus2 = {
        library: '2',
        cycle: testCycle.id,
        lastActivity: null,
        description: 'some desc',
        isComplete: true,
    };

    let cycle = await cycleRepository.load(testCycle.id);
    return libraryStatusRepository.create(testLibraryStatus1, cycle)
        .then(() => libraryStatusRepository.create(testLibraryStatus2, cycle));
}
