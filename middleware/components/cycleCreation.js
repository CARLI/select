
var Q = require('q');

var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils');

function create( newCycleData ) {
    return cycleRepository.create(newCycleData);

}

function copyCycleDataFrom( sourceCycleId, newCycleId ){
    var sourceCycle = null;
    var newCycle = null;

    return loadCycles()
        .then(replicate)
        .then(indexViews)
        .then(waitForIndexingToFinish)
        .then(transformOfferings)
        .then(indexViews)
        .then(waitForIndexingToFinish)
        .then(setCycleToNextPhase)
        .thenResolve(newCycleId)
        .catch(console.log);

    function loadCycles() {
        return Q.all([
            cycleRepository.load(sourceCycleId),
            cycleRepository.load(newCycleId)
        ]).then(function (cycles) {
            sourceCycle = cycles[0];
            newCycle = cycles[1];
            return true;
        });
    }
    function replicate() {
        cycleRepository.createCycleLog('Replicating data from '+ sourceCycle.databaseName +' to '+ newCycle.databaseName);
        return couchUtils.replicateFrom(sourceCycle.databaseName).to(newCycle.databaseName)
    }
    function transformOfferings() {
        cycleRepository.createCycleLog('Transforming offerings for new cycle');
        return offeringRepository.transformOfferingsForNewCycle(newCycle, sourceCycle);
    }
    function indexViews() {
        cycleRepository.createCycleLog('Triggering view indexing for ' + newCycle.name + ' with database ' + newCycle.getDatabaseName());
        return couchUtils.triggerViewIndexing(newCycle.getDatabaseName());
    }
    function waitForIndexingToFinish() {
        var waitForIndex = Q.defer();

        var trustViewIndex = false;
        var intervalId = setInterval(checkIndexStatus, 1000);

        function checkIndexStatus() {
            getViewIndexingStatus(newCycle).then(function (progress) {
                if (progress < 100) {
                    trustViewIndex = true;
                }
                if (trustViewIndex && progress == 100) {
                    clearInterval(intervalId);
                    waitForIndex.resolve();
                }
            });
        }

        return waitForIndex.promise;
    }
    function setCycleToNextPhase() {
        console.log('Proceeding to next phase');
        return cycleRepository.load(newCycle.id).then(function (newerCycle) {
            newerCycle.proceedToNextStep();
            cycleRepository.update(newerCycle)
                .catch(function (err) {
                    console.log('Failed state transition: ', err);
                });
        });
    }
}

function getCycleCreationStatus( cycleId ){

    return cycleRepository.load(cycleId)
        .catch(function(err){
            throw new Error('no Cycle found with id '+cycleId);
        })
        .then(getStatusForCycle)
        .then(gatherStatusResults);

    function getStatusForCycle( cycle ){
        var couchJobsPromise = couchUtils.getRunningCouchJobs();

        return Q.all([
            getNewCycleReplicationStatus(cycle, couchJobsPromise),
            getViewIndexingStatus(cycle, couchJobsPromise),
            getOfferingTransformationStatus(cycle)
        ]);
    }

    function getNewCycleReplicationStatus( cycle, couchJobsPromise ){
        return couchJobsPromise.then(filterReplicationJobs).then(filterByTargetCycle).then(resolveToProgress);

        function filterReplicationJobs( jobs ){
            return jobs.filter(function(job){
                return job.type === 'replication';
            });
        }

        function filterByTargetCycle( jobs ){
            return jobs.filter(function(job){
                return job.target === cycle.getDatabaseName();
            });
        }
    }

    function getOfferingTransformationStatus( cycle ){
        return cycle.offeringTransformationPercentComplete || 0;
    }

    function gatherStatusResults( resultsArray ){
        var replicationStatus = resultsArray[0] || 0;
        var viewIndexingStatus = resultsArray[1] || 0;
        var offeringTransformationStatus = resultsArray[2] || 0;

        return {
            replication: replicationStatus,
            viewIndexing: viewIndexingStatus,
            offeringTransformation: offeringTransformationStatus
        }
    }
}

function getViewIndexingStatus( cycle, couchJobsPromise ){
    if (!couchJobsPromise) {
        couchJobsPromise = couchUtils.getRunningCouchJobs();
    }
    return couchJobsPromise.then(filterIndexJobs).then(filterByCycle).then(resolveToProgress);

    function filterIndexJobs( jobs ){
        return jobs.filter(function(job){
            return job.type === 'indexer';
        });
    }

    function filterByCycle( jobs ){
        return jobs.filter(function(job){
            return job.database === cycle.getDatabaseName();
        });
    }
}

function resolveToProgress( jobs ){
    return jobs.length ? jobs[0].progress : 100;
}

module.exports = {
    create: create,
    copyCycleDataFrom: copyCycleDataFrom,
    getCycleCreationStatus: getCycleCreationStatus
};
