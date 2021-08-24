#!/usr/bin/env node

console.log("This one-off script has already been run on production and is only retained for future reference.");
process.exit();

// https://jira.pixotech.com/browse/CS-27
// Ovid: LWW Nursing & Health Professions Premier Collection
// const theAffectedProductId = "d45cc077-cf52-4bff-a504-a309326bc6db";
// ProQuest: The Complete History in Video Package
const theAffectedProductId = "87d1d984-ed3a-42b6-b23b-b79fb2362579";
const fiscalYear2020Id = "548373da-5ac8-4d89-8a15-ff483be25822";

var _ = require('lodash');
var path = require('path');
var Q = require('q');

var cli = require('../CARLI/CommandLine');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var offeringRepository = require('../CARLI/Entity/OfferingRepository');

listDuplicateOfferingsForCycle(fiscalYear2020Id);

function listDuplicateOfferingsForCycle(cycleId) {
    return cli.asCouchAdmin(listDuplicateOfferings);

    function listDuplicateOfferings() {
        var currentCycle = null;

        return loadCurrentCycle()
            .then(loadOfferingsFromCurrentCycle)
            .then(filterByProduct)
            .then(compileListOfDuplicates)
            .then(deleteOfferingsNotInVendorDatabase)
            .then(debug)
            .catch(debug);

        function debug(promises) {
            var okPromises = promises.filter(function (p) {
                return p.state === "fulfilled"
            });
            var failedPromises = promises.filter(function (p) {
                return p.state === "rejected"
            });
            Logger.log("Deleted " + okPromises.length + " offerings");
            Logger.log("Errors from " + failedPromises.length + " offerings");
            failedPromises.forEach(function (p) {
                Logger.log(p.reason);
            });
        }

        function loadCurrentCycle() {
            return cycleRepository.load(cycleId).then(setCurrentCycle);

            function setCurrentCycle(cycle) {
                currentCycle = cycle;
                return currentCycle;
            }
        }

        function loadOfferingsFromCurrentCycle(cycle) {
            Logger.debug('Loading offerings for ' + cycle.name);
            return offeringRepository.listOfferingsUnexpanded(cycle);
        }

        function filterByProduct(offerings) {
            return offerings.filter(onlyTheAffectedProduct);

            function onlyTheAffectedProduct(offering) {
                return offering.product === theAffectedProductId;
            }
        }

        function compileListOfDuplicates(offerings) {
            Logger.log('Loaded ' + offerings.length + ' offerings');

            var offeringsByProductPlusLibrary = {};

            offerings.forEach(trackOffering);

            return offeringsByIdAsArray().filter(hasDuplicates);

            function trackOffering(offering) {
                var productId = offering.product;
                var libraryId = offering.library;

                var trackId = productId + '-' + libraryId;

                var trackObject = {
                    productId: productId,
                    libraryId: libraryId,
                    offeringId: offering.id,
                    pricing: offering.pricing,
                    display: offering.display
                };

                offeringsByProductPlusLibrary[trackId] = offeringsByProductPlusLibrary[trackId] || [];
                offeringsByProductPlusLibrary[trackId].push(trackObject);
            }

            function offeringsByIdAsArray() {
                return Object.keys(offeringsByProductPlusLibrary).map(function (key) {
                    return offeringsByProductPlusLibrary[key];
                });
            }

            function hasDuplicates(item) {
                return item && item.length > 1;
            }
        }

        function deleteOfferingsNotInVendorDatabase(listOfDuplicateTrackObjects) {
            const offeringsInVendorDatabase = [];

            // flatten the duplicates into a single list
            // delete every offering not in the vendor database
            var promises;
            return Q.allSettled(promises);
        }

        function deleteOfferingsWithNoPriceData(listOfDuplicateTrackObjects) {

            var promises = listOfDuplicateTrackObjects.map(function (listOfTrackObjects) {

                var trackObjectsWithNoPriceData = listOfTrackObjects.filter(function (trackObject) {
                    return !hasAnyPrice(trackObject);
                });

                var theTrackObjectForTheOfferingToDelete = trackObjectsWithNoPriceData[0];

                var d = Q.defer();
                if (trackObjectsWithNoPriceData.length === 1)
                    return offeringRepository.delete(theTrackObjectForTheOfferingToDelete.offeringId, currentCycle);
                else
                    d.reject("Found "+trackObjectsWithNoPriceData.length+" out of "+listOfTrackObjects.length+" records to delete");

                return d.promise;
            });

            return Q.allSettled(promises);
        }
    }
}

function hasAnyPrice(offering) {
    if (!offering.hasOwnProperty('pricing'))
        return false;
    if (offering.pricing.hasOwnProperty('site') && offering.pricing.site > 0)
        return true;
    if (offering.pricing.hasOwnProperty('su') && offering.pricing.su.length > 0)
        return true;
    return false;
}

