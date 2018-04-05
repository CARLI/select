#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var Q = require('q');

var cli = require('../CARLI/CommandLine');
var cycleRepository = require('../CARLI/Entity/CycleRepository');

var couchUtils = require('../CARLI/Store/CouchDb/Utils')();
var Entity = require('../CARLI/Entity');
var getStoreForCycle = require('../CARLI/Entity/getStoreForCycle');
var offeringEntityRepo = Entity('Offering');

cli.withSingleArgument('cycle-id', listDuplicateOfferingsForCycle);

function listDuplicateOfferingsForCycle(cycleId) {
    return cli.asCouchAdmin(repairOfferingCycleProperties);

    function repairOfferingCycleProperties() {
        var currentCycle = null;
        var aberrantCycleValueCounts = {};

        return loadCurrentCycle()
            .then(loadOfferingsFromCurrentCycle)
            .then(compileListOfOfferings)
            .then(saveRepairedOfferings)
            .then(reportRepairedOfferings);

        function loadCurrentCycle() {
            return cycleRepository.load(cycleId).then(setCurrentCycle);

            function setCurrentCycle(cycle) {
                currentCycle = cycle;
                return currentCycle;
            }
        }

        function loadOfferingsFromCurrentCycle(cycle) {
            Logger.debug('Loading offerings for ' + cycle.name);
            offeringEntityRepo.setStore(getStoreForCycle(cycle, {}));
            return offeringEntityRepo.list(cycle.getDatabaseName());
        }

        function compileListOfOfferings(offerings) {
            Logger.log('Loaded ' + offerings.length + ' offerings. Ensuring that each one has cycle property = ' + cycleId);

            var modifiedOfferings = [];

            offerings.forEach(ensureOfferingHasCorrectCycleProperty);

            return modifiedOfferings;

            function ensureOfferingHasCorrectCycleProperty(offering) {
                if ( offering.cycle !== cycleId ) {
                    recordBadCycleValue(offering.cycle);
                    offering.cycle = cycleId;
                    modifiedOfferings.push(offering);
                }
            }

            function recordBadCycleValue(cycleValue) {
                var value = JSON.stringify(cycleValue);
                if ( aberrantCycleValueCounts[value] ) {
                    aberrantCycleValueCounts[value] = aberrantCycleValueCounts[value] + 1;
                }
                else {
                    aberrantCycleValueCounts[value] = 1;
                }
            }
        }

        function saveRepairedOfferings(listOfOfferingsToUpdate) {
            return couchUtils.bulkUpdateDocuments(currentCycle.getDatabaseName(), listOfOfferingsToUpdate)
                .catch(function (err) {
                    console.log('Error bulk updating ' + listOfOfferingsToUpdate.length + ' offerings', err);
                });
        }

        function reportRepairedOfferings(reportData) {
            var badValues = Object.keys(aberrantCycleValueCounts);

            if ( badValues.length ) {
                console.log('Bad Cycle Values');

                badValues.forEach(function (badValue) {
                    console.log(badValue + ' \t' + aberrantCycleValueCounts[badValue]);
                });
            }

            console.log('Repaired ' + reportData.length + ' offerings');
        }
    }
}
