#!/usr/bin/env node

var _ = require('lodash');
var path = require('path');
var Q = require('q');

var cli = require('../CARLI/CommandLine');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var libraryRepository = require('../CARLI/Entity/LibraryRepository');
var offeringRepository = require('../CARLI/Entity/OfferingRepository');
var productRepository = require('../CARLI/Entity/ProductRepository');

cli.withSingleArgument('cycle-id', listDuplicateOfferingsForCycle);

function listDuplicateOfferingsForCycle(cycleId) {
    return cli.asCouchAdmin(listDuplicateOfferings);

    function listDuplicateOfferings() {
        var currentCycle = null;

        return loadCycle()
            .then(loadOfferingsFromCycle)
            .then(filterToSubcentPricing)
            .then(loadNamesForDuplicateOfferings)
            .then(reportFilteredOfferings);

        function loadCycle() {
            return cycleRepository.load(cycleId).then(setCurrentCycle);

            function setCurrentCycle(cycle) {
                currentCycle = cycle;
                return currentCycle;
            }
        }

        function loadOfferingsFromCycle(cycle) {
            Logger.debug('Loading offerings for ' + cycle.name);
            return offeringRepository.listOfferingsUnexpanded(cycle);
        }

        function filterToSubcentPricing(offerings) {
            return offerings.filter(function(offering) {
                const pricing = offering.pricing;
                let hasSubcentPricing = false;
                if(pricing.su) {
                    hasSubcentPricing = hasSubcentPricing || pricing.su.some(function(row) {
                        if(checkSubcentPricing(row.price))
                            console.log(row.price, row.price * 100 % 1);
                        return checkSubcentPricing(row.price);
                    });
                }
                if(checkSubcentPricing(pricing.site))
                    console.log(pricing.site, pricing.site * 100 % 1);
                hasSubcentPricing = hasSubcentPricing || checkSubcentPricing(pricing.site);

                if(hasSubcentPricing)
                    console.log(`Found subcent pricing for offering ${offering.id} in cycle ${currentCycle.name}`);

                return hasSubcentPricing;

                function checkSubcentPricing(price) {
                    const subcentAmount = price * 100 % 1;
                    return subcentAmount > 0.0001 && subcentAmount < 0.9999;
                }

            });

        }

        function loadNamesForDuplicateOfferings(listOfListsOfDuplicateIdsByProductAndLibrary) {
            var librariesToLoad = {};
            var productsToLoad = {};

            var librariesById = {};
            var productsById = {};

            var duplicateOfferingReportData = [];

            listOfListsOfDuplicateIdsByProductAndLibrary.forEach(gatherProductsAndLibrariesToLoad);

            function gatherProductsAndLibrariesToLoad(offering) {
                var productId = offering.product;
                var libraryId = offering.library;

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
                listOfListsOfDuplicateIdsByProductAndLibrary.forEach(function (offering) {
                    var productId = offering.product;
                    var libraryId = offering.library;
                    var offeringData = offering.pricing;

                    duplicateOfferingReportData.push({
                        product: productsById[productId].name,
                        library: librariesById[libraryId].name,
                        offeringPricingById: offeringData
                    });
                });

                return duplicateOfferingReportData;
            }
        }

        function reportFilteredOfferings(duplicateOfferingInformation) {
            duplicateOfferingInformation.forEach((offering, index) => {
                console.log(` *start* Offering ${index + 1} of ${duplicateOfferingInformation.length}`);
                logDuplicate(offering);
                console.log(` *end* Offering ${index + 1} of ${duplicateOfferingInformation.length}`);
                console.log('');
            });

            function logDuplicate(data) {
                console.log(data.library + ' - ' + data.product);
                var pricing = data.offeringPricingById;
                logOfferingPricing(pricing);
            }

            function logOfferingPricing(pricingData) {
                if ( pricingData && pricingData.site ){
                    console.log(`site - ${pricingData.site}`);
                }

                if ( pricingData && pricingData.su && pricingData.su.length ) {
                    console.log("su pricing:");
                    pricingData.su.forEach(function (row) {
                        console.log(`    ${row.users} - ${row.price}`);
                    });
                }
            }
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
