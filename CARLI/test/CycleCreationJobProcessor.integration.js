const expect = require('chai').expect;
const Q = require('q');

const realCouchUtils = require('../Store/CouchDb/Utils')();
const Store = require('../Store');
const MemoryStore = require('../Store/MemoryStore');

const noop = () => Q(true);

const mockCouchUtils = {
    makeValidCouchDbName: realCouchUtils.makeValidCouchDbName,
    createDatabase: noop
}

const realCycleRepository = require('../Entity/CycleRepository');
const realOfferingRepository = require('../Entity/OfferingRepository');
const realProductRepository = require('../Entity/ProductRepository');
const realVendorRepository = require('../Entity/VendorRepository');

const realLibraryStatusRepository = require('../Entity/LibraryStatusRepository');
const realVendorStatusRepository = require('../Entity/VendorStatusRepository');

var CycleCreationJobProcessor = require('../CycleCreationJobProcessor');

var testCycleCreationJob = createTestCycleCreationJob();
const timestamper = {
    getCurrentTimestamp: function () {
        return new Date().toISOString();
    }
}

describe.only('Integration Test for a Cycle Creation Job Processor', function () {
    it('runs a complete cycle creation process', () => {
        const couchUtilsStub = {
            replicateFrom: () => true,
            triggerViewIndexing: () => true
        }

        const processorParams = {
            cycleRepository: realCycleRepository,
            couchUtils: couchUtilsStub,
            timestamper,
            offeringRepository: realOfferingRepository,
            libraryStatusRepository: realLibraryStatusRepository,
            vendorStatusRepository: realVendorStatusRepository
        }
        const cycleCreationJobProcessor = CycleCreationJobProcessor(processorParams);

        populateRepositories()
            .then(() => cycleCreationJobProcessor.process(testCycleCreationJob))
    });
});

function inMemoryStore() {
    return Store(MemoryStore());
}

function createTestCycleCreationJob() {
    return {
        type: 'CycleCreationJob',
        sourceCycle: 'cycle1',
        targetCycle: 'cycle2'
    };
}

function populateRepositories() {
    realCycleRepository.overrideStore(inMemoryStore(), mockCouchUtils);
    realOfferingRepository.overrideStore(inMemoryStore(), mockCouchUtils);
    realVendorRepository.overrideStore(inMemoryStore(), mockCouchUtils);
    realLibraryStatusRepository.setStore(inMemoryStore());
    realVendorStatusRepository.setStore(inMemoryStore());

    return populateCycleRepository()
        .then(populateVendorRepository)
        .then(populateProductRepository)
        //.then(populateOfferingRepository)
        .catch(err => {
            console.log('Error creating test data: ', err);
        })
}

const testCycle = {
    id: 'cycle1',
    name: 'Cycle 1',
    cycleType: 'Calendar Year',
    year: 3001,
    status: 5,
    isArchived: false,
    getDatabaseName: () => 'unused'
}

function populateCycleRepository() {
    return realCycleRepository.create(testCycle)
}

function populateProductRepository() {
    realProductRepository.overrideStore(inMemoryStore(), mockCouchUtils);

    const product1 = {
        id: 'product1',
        name: 'Product1',
        cycle: 'cycle1',
        vendor: 'vendor1',
        description: 'A fake product number one'
    };
    const product2 = {
        id: 'product2',
        name: 'Product2',
        cycle: 'cycle1',
        vendor: 'vendor1',
        description: 'A fake product number two'
    };

    return realProductRepository.create(product1, testCycle)
        .then(() => realProductRepository.create(product2, testCycle))
}

function populateVendorRepository() {
    const vendor1 = {
        id: 'vendor1',
        name: 'Vendor1'
    };

    return realVendorRepository.create(vendor1)
}

function populateOfferingRepository() {
    //Product 1 and 2 for Library 1
    const offering1 = {
        id: 'offering1',
        cycle: 'cycle1',
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
        cycle: 'cycle1',
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
        cycle: 'cycle1',
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
        cycle: 'cycle1',
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

    return realOfferingRepository.create(offering1)
        .then(() => realOfferingRepository.create(offering2))
        .then(() => realOfferingRepository.create(offering3))
        .then(() => realOfferingRepository.create(offering4))
}