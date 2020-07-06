#!/usr/bin/env node

const cli = require('../CARLI/CommandLine');
const cycleRepository = require('../CARLI/Entity/CycleRepository');
const productRepository = require('../CARLI/Entity/ProductRepository');
const couchUtils = require('../CARLI/Store/CouchDb/Utils')();

const CURRENT_CYCLE_ID = "5eaf42ea-d2b6-46f3-94dd-5eab010b9e13"; // Calendar Year 2020
const PREVIOUS_CYCLE_ID = "6dd98646-79ca-4fb0-8a03-46c79b87be8c"; // Calendar Year 2019

cli.asCouchAdmin(() => repairCycleDb(CURRENT_CYCLE_ID, PREVIOUS_CYCLE_ID));

async function repairCycleDb(currentCycleId, previousCycleId) {
    const currentCycle = await cycleRepository.load(currentCycleId);
    const previousCycle = await cycleRepository.load(previousCycleId);

    const currentProducts = await productRepository.listProductsUnexpanded(currentCycle).then(groupById);
    const previousProducts = await productRepository.listProductsUnexpanded(previousCycle).then(groupById);

    const ok = [];
    const skipped = [];
    const repaired = [];
    const missingFromPreviousCycle = [];

    Object.keys(currentProducts).forEach(productId => {
        if (!previousProducts.hasOwnProperty(productId)) {
            missingFromPreviousCycle.push(productId);
            return;
        }
        const currentProduct = currentProducts[productId];
        const previousProduct = previousProducts[productId];

        const hasVendor = currentProduct.hasOwnProperty('vendor');
        const hasLicense = currentProduct.hasOwnProperty('license');

        if (hasVendor && hasLicense) {
            ok.push(productId)
        } else {
            if (previousProduct.hasOwnProperty('vendor') && previousProduct.hasOwnProperty('license')) {
                currentProduct.vendor = previousProduct.vendor;
                currentProduct.license = previousProduct.license;
                repaired.push(currentProduct);
            } else {
                skipped.push(productId);
            }
        }
    });

    const couchResponse = await couchUtils.bulkUpdateDocuments(currentCycle.getDatabaseName(), repaired);

    console.log(`Ignored ${ok.length} ok products`);
    console.log(`Skipped ${missingFromPreviousCycle.length} products missing from ${previousCycle.name}`);
    console.log(`Skipped ${skipped.length} products missing data`);
    console.log(`Repaired ${repaired.length} products`);
    console.log('Couch Response:');
    console.log(couchResponse);
}

function groupById(list) {
    const o = {};
    list.forEach(item => o[item.id] = item);
    return o;
}
