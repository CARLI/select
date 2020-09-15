const expect = require('chai').expect;
const Q = require('q');

const Store = require('../Store');
const MemoryStore = require('../Store/MemoryStore');

const realCycleRepository = require('../Entity/CycleRepository');
realCycleRepository.overrideStore(inMemoryStore());
const realOfferingRepository = require('../Entity/OfferingRepository');
realOfferingRepository.overrideStore(inMemoryStore());
const realProductRepository = require('../Entity/ProductRepository');
realProductRepository.overrideStore(inMemoryStore());

const realLibraryStatusRepository = require('../Entity/LibraryStatusRepository');
realLibraryStatusRepository.setStore(inMemoryStore());
const realVendorStatusRepository = require('../Entity/VendorStatusRepository');
realVendorStatusRepository.setStore(inMemoryStore());

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


    .
        then(function () {
            cycleCreationJobProcessor.process(testCycleCreationJob);
        })

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

function populateCycleRepository() {
    const cycle1 = {
        name: 'cycle1',
        cycleType: 'Calendar Year',
        year: 3001,
        status: 5,
        isArchived: false
    };
    const cycle2 = {
        name: 'cycle2',
        cycleType: 'Calendar Year',
        year: 3002,
        status: 0,
        isArchived: false
    };

    return realCycleRepository.create(cycle1)
        .then(() => realCycleRepository.create(cycle2))
}

function populate
