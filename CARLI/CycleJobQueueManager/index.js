const CycleCreationJobProcessor = require("../CycleCreationJobProcessor");
const couchUtils = require('../Store/CouchDb/Utils')();
const cycleRepository = require('../Entity/CycleRepository');
const offeringRepository = require('../Entity/OfferingRepository');
const productRepository = require('../Entity/ProductRepository');
const vendorRepository = require('../Entity/VendorRepository');
const libraryRepository = require('../Entity/LibraryRepository');
const libraryStatusRepository = require('../Entity/LibraryStatusRepository');
const vendorStatusRepository = require('../Entity/VendorStatusRepository');
const cycleCreationJobRepository = require('../Entity/CycleCreationJobRepository');

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
    vendorStatusRepository
}

async function CycleJobQueueManager() {
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

    async function Start(sourceCycleId, targetCycleData){
        cycleCreationJob = await createCycleCreationJob(sourceCycleId, targetCycleData.id);
        await cycleCreationJobProcessor.initializeNewCycle(targetCycleData);
        await Resume(cycleCreationJob.id);
    }

    async function Resume(jobId){
        if(!cycleCreationJob)
                cycleCreationJob = await cycleCreationJobRepository.load(jobId);

        while(cycleCreationJobProcessor._getCurrentStepForJob(cycleCreationJob) !== "done") {
            const currentStep = cycleCreationJobProcessor._getCurrentStepForJob(testCycleCreationJob);
            console.log("[START]: " + currentStep);
            await cycleCreationJobProcessor.process(cycleCreationJob);
            console.log("[END]: " + currentStep);
        }
    }

    return {
        start: Start,
        resume: Resume
    }
}
