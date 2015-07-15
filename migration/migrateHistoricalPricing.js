var cycleRepository = require('../CARLI/Entity/CycleRepository');
var historicalPricingMigration = require('./historicalPricing');
var Q = require('q');

/**
 * This script goes through all of the cycles and fills in historical pricing for all of the offerings in each.
 */

migrateHistoricalPricingForAllCyclesSerially();


function migrateHistoricalPricingForAllCyclesSerially() {
    return cycleRepository.listActiveCycles()
        .then(function (cycles) {
            var cycleList = cycles;
            return migrateHistoricalPricingForNextCycle();

            function migrateHistoricalPricingForNextCycle() {
                var cycle = cycleList.pop();

                if (!cycle) {
                    return;
                }

                return historicalPricingMigration.populateHistoricalPricingForCycle(cycle.id)
                    .then(migrateHistoricalPricingForNextCycle)
                    .catch(function (e) {
                        console.log(e);
                    });
            }
        })
        .done();
}

function populateOneCycle(cycleId){
    return historicalPricingMigration.populateHistoricalPricingForCycle(cycleId)
        .catch(function (e) {
            console.log(e);
        });
}
