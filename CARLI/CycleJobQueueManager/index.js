const _ = require('lodash');
const config = require( '../../config' );
const CycleCreationJobProcessor = require("../CycleCreationJobProcessor");
const CouchUtils = require('../Store/CouchDb/Utils');
const cycleRepository = require('../Entity/CycleRepository');
const offeringRepository = require('../Entity/OfferingRepository');
const productRepository = require('../Entity/ProductRepository');
const vendorRepository = require('../Entity/VendorRepository');
const libraryRepository = require('../Entity/LibraryRepository');
const libraryStatusRepository = require('../Entity/LibraryStatusRepository');
const vendorStatusRepository = require('../Entity/VendorStatusRepository');
const cycleCreationJobRepository = require('../Entity/CycleCreationJobRepository');
const Store = require( '../../CARLI/Store' );
const StoreModule = require( '../../CARLI/Store/CouchDb/Store');

const StoreOptions = config.storeOptions;
let couchUtils = null;

useAdminCouchCredentials();

function useAdminCouchCredentials() {
    var adminStoreOptions = _.clone(StoreOptions);
    adminStoreOptions.couchDbUrl = StoreOptions.privilegedCouchDbUrl;

    couchUtils = CouchUtils(adminStoreOptions);
    cycleRepository.setStore(Store(StoreModule(adminStoreOptions)));
    libraryRepository.setStore(Store(StoreModule(adminStoreOptions)));
    libraryStatusRepository.setStore(Store(StoreModule(adminStoreOptions)));
    offeringRepository.setStore(Store(StoreModule(adminStoreOptions)));
    productRepository.setStore(Store(StoreModule(adminStoreOptions)));
    vendorRepository.setStore(Store(StoreModule(adminStoreOptions)));
    vendorStatusRepository.setStore(Store(StoreModule(adminStoreOptions)));
    cycleCreationJobRepository.setStore(Store(StoreModule(adminStoreOptions)));
}

const timestamper = {
    getCurrentTimestamp: function () {
        return new Date().toISOString();
    }
}

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

function CycleJobQueueManager() {
    const cycleCreationJobProcessor = CycleCreationJobProcessor(processorParams);
    let cycleCreationJob;

    function createCycleCreationJob(sourceCycleId, targetCycleId) {
        const job = {
            type: 'CycleCreationJob',
            sourceCycle: sourceCycleId,
            targetCycle: targetCycleId
        };

        return cycleCreationJobRepository.create(job);
    }

    async function start(sourceCycleId, serializedTargetCycleData){
        const targetCycleData = JSON.parse(serializedTargetCycleData);
        let targetCycleId = await cycleCreationJobProcessor.initializeNewCycle(targetCycleData);
        try {
            Logger.log("[START] Creating Cycle Creation Job");
            const jobId = await createCycleCreationJob(sourceCycleId, targetCycleId);
            Logger.log("[END] Created Cycle Creation Job");
            await resume(jobId);
        }
        catch (err) {
            Logger.log("Job creation failed!");
            Logger.log(err);
            Logger.log(err.stack);
        }
    }

    async function resume(jobId){
        if(!cycleCreationJob)
                cycleCreationJob = await cycleCreationJobRepository.load(jobId);
        while(await cycleCreationJobProcessor._getCurrentStepForJob(cycleCreationJob.id) !== "done") {
            const currentStep = await cycleCreationJobProcessor._getCurrentStepForJob(cycleCreationJob.id);
            Logger.log("[START]: " + currentStep);
            var status = await cycleCreationJobProcessor.process(cycleCreationJob.id);

            Logger.log("status here: " + status);

            if(!status.succeeded)
            {
                break;
            }

            Logger.log("[END]: " + currentStep);
        }
    }

    return {
        start,
        resume
    }
}

module.exports = CycleJobQueueManager;

