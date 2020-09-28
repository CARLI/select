var cluster = require('cluster');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils');
var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository');
var libraryStatusRepository = require('../../CARLI/Entity/LibraryStatusRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository');
var productRepository = require('../../CARLI/Entity/ProductRepository');
var vendorRepository = require('../../CARLI/Entity/VendorRepository');
var vendorStatusRepository = require('../../CARLI/Entity/VendorStatusRepository');
var CycleCreationJobProcessor = require('../CARLI/CycleCreationJobProcessor');
var cycleCreationJobRepository = require('../CARLI/Entity/CycleCreationJobRepository')
var vendorDatabases = require('./components/vendorDatabases');

var timestamper = {
    getCurrentTimestamp: function () {
        return new Date().toISOString();
    }
}

var processor = CycleCreationJobProcessor({
    cycleRepository,
    couchUtils,
    timestamper,
    productRepository,
    offeringRepository,
    vendorRepository,
    libraryRepository,
    libraryStatusRepository,
    vendorStatusRepository
})

async function doWork() {
    var jobId = process.env.jobId;
    var job = await cycleCreationJobRepository.load(jobId);
    Logger.log('Cycle creation processing', job);

    processor.process(job)
        .then(function(){ cycleCreationJobRepository.update(job) })
        .then(exitWorker)
        .catch(function (err) {
            Logger.log('Cycle creation failed', err);
        });
/* TODO: move into the processor as the last step
        Create Shards (confirm that these get created somewhere)
        move these two steps into the processor:
        .then(vendorDatabases.replicateDataToVendorsForCycle)
        .then(vendorDatabases.triggerIndexingForCycleId)
*/
}

doWork();

function exitWorker() {
    cluster.worker.kill();
}
