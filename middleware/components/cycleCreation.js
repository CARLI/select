
var Q = require('q');

var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils');

function create( newCycleData ) {
    return cycleRepository.create(newCycleData);

}

function copyCycleDataFrom( sourceCycle, newCycleId ){
    return cycleRepository.load(newCycleId)
        .then(function (newCycle) {
            cycleRepository.createCycleLog('Replicating data from '+ sourceCycle.databaseName +' to '+ newCycle.databaseName);
            return couchUtils.replicateFrom(sourceCycle.databaseName).to(newCycle.databaseName).thenResolve(newCycle);
        })
        .then(function(newCycle){
            cycleRepository.createCycleLog('Transforming offerings for new cycle');
            return offeringRepository.transformOfferingsForNewCycle(newCycle, sourceCycle);
        })
        .then(function(newCycle) {
            cycleRepository.createCycleLog('Triggering view indexing for ' + newCycle.name + ' with database ' + newCycle.getDatabaseName());
            return couchUtils.triggerViewIndexing(newCycle.getDatabaseName());
        })
        .then(function() {
            return newCycleId;
        });
}

function getCycleCreationStatus( cycleId ){

    return cycleRepository.load(cycleId)
        .catch(function(err){
            throw new Error('no Cycle found with id '+cycleId);
        })
        .then(getStatusForCycle)
        .then(gatherStatusResults);

    function getStatusForCycle( cycle ){
        return Q.all([
            getNewCycleReplicationStatus(cycle),
            getOfferingTransformationStatus(cycle),
            getViewIndexingStatus(cycle)
        ]);
    }

    function getNewCycleReplicationStatus( cycle ){
        return couchUtils.getRunningCouchJobs().then(filterReplicationJobs).then(filterByTargetCycle).then(resolveToProgress);

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

    function getViewIndexingStatus( cycle ){
        return couchUtils.getRunningCouchJobs().then(filterIndexJobs).then(filterByCycle).then(resolveToProgress);

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

    function gatherStatusResults( resultsArray ){
        var replicationStatus = resultsArray[0] || 0;
        var offeringTransformationStatus = resultsArray[1] || 0;
        var viewIndexingStatus = resultsArray[2] || 0;

        return {
            replication: replicationStatus,
            offeringTransformation: offeringTransformationStatus,
            viewIndexing: viewIndexingStatus
        }
    }


}

module.exports = {
    create: create,
    copyCycleDataFrom: copyCycleDataFrom,
    getCycleCreationStatus: getCycleCreationStatus
};
