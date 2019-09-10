#!/usr/bin/env node

const cli = require('../CARLI/CommandLine');
const cycleRepository = require('../CARLI/Entity/CycleRepository');
const offeringRepository = require('../CARLI/Entity/OfferingRepository');
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
    const repaired = [];
    const missingFromPreviousCycle = [];

    Object.keys(currentProducts).forEach(productId => {
        if (!previousProducts.hasOwnProperty(productId)) {
            missingFromPreviousCycle.push(productId);
            return;
        }
        const currentProduct = currentProducts[productId];
        const hasCycle = currentProduct.hasOwnProperty('cycle');

        if (hasCycle) {
            ok.push(productId)
        } else {
            currentProduct.cycle = CURRENT_CYCLE_ID;
            repaired.push(currentProduct);
        }
    });

    const couchResponse = await couchUtils.bulkUpdateDocuments(currentCycle.getDatabaseName(), repaired);

    console.log(`Ignored ${ok.length} ok products`);
    console.log(`Skipped ${missingFromPreviousCycle.length} products missing from ${previousCycle.name}`);
    console.log(`Repaired ${repaired.length} products`);
    console.log('Couch Response:');
    console.log(couchResponse);
}

function groupById(list) {
    const o = {};
    list.forEach(item => o[item.id] = item);
    return o;
}

