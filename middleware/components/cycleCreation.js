
var cycleRepository = require('../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository');
var couchUtils = require('../../CARLI/Store/CouchDb/Utils');

function createCycleFrom( sourceCycle, newCycleData ) {
    return cycleRepository.create(newCycleData)
        .then(function(newCycleId) {
            return cycleRepository.load(newCycleId)
                .then(function (newCycle) {
                    return couchUtils.replicateFrom(sourceCycle.databaseName).to(newCycle.databaseName).thenResolve(newCycle);
                })
                .then(function(newCycle){
                    return offeringRepository.transformOfferingsForNewCycle(newCycle, sourceCycle);
                })
                .then(function() {
                    return newCycleId;
                });
        });
}

module.exports = {
    createCycleFrom: createCycleFrom
};
