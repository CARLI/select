var tv4 = require('tv4');
var formats = require('tv4-formats');

tv4.addFormat(formats);

var schemaFile = 'VendorSiteLicensePrice.json';
tv4.addSchema(schemaFile, require('../schemas/' + schemaFile));

function validate(vendorPricingObject) {
    var result = tv4.validateResult(vendorPricingObject, schemaFile);
    return !result.error;
}

function validateList(listOfVendorPricingObjects) {
    return listOfVendorPricingObjects.map(validate).reduce(countSuccesses, {valid: 0, invalid: 0});

    function countSuccesses(accumulator, nextValue) {
        if (nextValue)
            accumulator.valid++;
        else
            accumulator.invalid++;

        return accumulator;
    }
}

function groupByProduct(listOfVendorPricingObjects) {
    return listOfVendorPricingObjects.reduce(mapByProductId, {});

    function mapByProductId(byProductId, nextPriceObject) {
        byProductId[nextPriceObject.product] = byProductId[nextPriceObject.product] || [];
        byProductId[nextPriceObject.product].push(nextPriceObject);
        return byProductId;
    }
}

function groupByLibrary(listOfVendorPricingObjects) {
    return listOfVendorPricingObjects.reduce(mapByLibraryId, {});

    function mapByLibraryId(byLibraryId, nextPriceObject) {
        byLibraryId[nextPriceObject.library] = byLibraryId[nextPriceObject.library] || [];
        byLibraryId[nextPriceObject.library].push(nextPriceObject);
        return byLibraryId;
    }
}

module.exports = {
    validate: validate,
    validateList: validateList,
    groupByProduct: groupByProduct,
    groupByLibrary: groupByLibrary
};