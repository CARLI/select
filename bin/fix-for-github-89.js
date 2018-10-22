#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var Q = require('q');

var cli = require('../CARLI/CommandLine');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var libraryRepository = require('../CARLI/Entity/LibraryRepository');
var offeringRepository = require('../CARLI/Entity/OfferingRepository');
var productRepository = require('../CARLI/Entity/ProductRepository');

const BOTH_NOT_OFFERED = 1;
const BOTH_ARE_CORRECT = 2;
const FIRST_ONE_IS_CORRECT = 3;
const SECOND_ONE_IS_CORRECT = 4;

cli.withSingleArgument('cycle-id', listDuplicateOfferingsForCycle)
    .then(function() { console.log("done"); })
    .catch(function(error) { console.log(error); });

function listDuplicateOfferingsForCycle(cycleId) {
    return cli.asCouchAdmin(listDuplicateOfferings);

    function listDuplicateOfferings() {
        var currentCycle = null;

        return loadCurrentCycle()
            .then(loadOfferingsFromCurrentCycle)
            .then(compileListOfOfferings)
            .then(loadNamesForDuplicateOfferings)
            .then(deleteDuplicateOfferings);

        function loadCurrentCycle() {
            return cycleRepository.load(cycleId).then(setCurrentCycle);

            function setCurrentCycle(cycle) {
                currentCycle = cycle;
                console.log(currentCycle);
                return currentCycle;
            }
        }

        function loadOfferingsFromCurrentCycle(cycle) {
            Logger.debug('Loading offerings for ' + cycle.name);
            return offeringRepository.listOfferingsUnexpanded(cycle);
        }

        function compileListOfOfferings(offerings) {
            Logger.log('Loaded ' + offerings.length + ' offerings');

            var offeringsByProductPlusLibrary = {};

            offerings.forEach(trackOffering);

            return offeringsByIdAsArray().filter(hasDuplicates);


            function trackOffering(offering) {
                var productId = offering.product;
                var libraryId = offering.library;

                if (productId !== 'e3ceacaf-2a6d-42ec-a521-c4e31af3559a' ) {
                    return;
                }

                var trackId = productId + '-' + libraryId;

                var trackObject = {
                    productId: productId,
                    libraryId: libraryId,
                    offeringId: offering.id,
                    pricing: offering.pricing
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

        function loadNamesForDuplicateOfferings(listOfListsOfDuplicateIdsByProductAndLibrary) {
            var librariesToLoad = {};
            var productsToLoad = {};

            var librariesById = {};
            var productsById = {};

            var duplicateOfferingReportData = [];

            listOfListsOfDuplicateIdsByProductAndLibrary.forEach(gatherProductsAndLibrariesToLoad);

            function gatherProductsAndLibrariesToLoad(arrayOfTrackingObjects) {
                var productId = arrayOfTrackingObjects[0].productId;
                var libraryId = arrayOfTrackingObjects[0].libraryId;

                productsToLoad[productId] = true;
                librariesToLoad[libraryId] = true;
            }

            return loadLibraries()
                .then(saveLibraries)
                .then(loadProducts)
                .then(saveProducts)
                .then(attachEntityNamesAndFormatDuplicateInformation);

            function loadLibraries() {
                return libraryRepository.getLibrariesById(Object.keys(librariesToLoad));
            }

            function loadProducts() {
                return productRepository.getProductsById(Object.keys(productsToLoad), currentCycle);
            }

            function saveLibraries(listOfLibraries) {
                librariesById = entitiesById(listOfLibraries);
            }

            function saveProducts(listOfProducts) {
                productsById = entitiesById(listOfProducts);
            }

            function attachEntityNamesAndFormatDuplicateInformation() {
                listOfListsOfDuplicateIdsByProductAndLibrary.forEach(function (arrayOfTrackingObjects) {
                    var productId = arrayOfTrackingObjects[0].productId;
                    var libraryId = arrayOfTrackingObjects[0].libraryId;
                    var offeringData = getOfferingDataById(arrayOfTrackingObjects);

                    duplicateOfferingReportData.push({
                        product: productsById[productId].name,
                        library: librariesById[libraryId].name,
                        offeringPricingById: offeringData
                    });
                });

                return duplicateOfferingReportData;

                function getOfferingDataById(arrayOfTrackingObjects) {
                    var result = {};
                    arrayOfTrackingObjects.forEach(function (obj) {
                        result[obj.offeringId] = obj.pricing;
                    });
                    return result;
                }
            }
        }

        function deleteDuplicateOfferings(duplicateOfferingInformation) {
            var promises = duplicateOfferingInformation.map(function(data) {
                var offeringIds = Object.keys(data.offeringPricingById);
                var offeringPricingOne = data.offeringPricingById[offeringIds[0]];
                var offeringPricingTwo = data.offeringPricingById[offeringIds[1]];
                return deleteDuplicateFromOnePair(offeringIds[0], offeringPricingOne, offeringIds[1], offeringPricingTwo);
            });
            return Q.all(promises);
        }

        function deleteDuplicateFromOnePair(idOne, pricingOne, idTwo, pricingTwo) {

            status = getOfferingPricingStatus(pricingOne, pricingTwo);

            return deleteTheAppropriateOffering(idOne, idTwo, status);

            function getOfferingPricingStatus(pricingData1, pricingData2) {
                if (pricingData1.site === 1000 && pricingData2.site === 1000)
                    return BOTH_ARE_CORRECT;

                if (pricingData1.site === 1000)
                    return FIRST_ONE_IS_CORRECT;
                if (pricingData2.site === 1000)
                    return SECOND_ONE_IS_CORRECT;

                return BOTH_NOT_OFFERED;
            } 
        }
        function deleteTheAppropriateOffering(firstOne, secondOne, status) {
            // if (status === BOTH_ARE_CORRECT || status === BOTH_NOT_OFFERED)
            //     console.log("Would delete one randomly");
            // else if (status === FIRST_ONE_IS_CORRECT)
            //     console.log("Will delete first one");
            // else if (status === SECOND_ONE_IS_CORRECT)
            //     console.log("Will delete second one");

            if (status === SECOND_ONE_IS_CORRECT) {
                return deleteOffering(firstOne);
            } else {
                return deleteOffering(secondOne);
            }
        }

        function deleteOffering(offeringId) {
            console.log("Deleting offering " + offeringId + " from " + currentCycle.databaseName);
            return offeringRepository.delete(offeringId, currentCycle);
        }
    }



    function entitiesById(arrayOfEntities) {
        var entitiesById = {};

        arrayOfEntities.forEach(function (entity) {
            entitiesById[entity.id] = entity;
        });

        return entitiesById;
    }
}
