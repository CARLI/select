
var csvExport = require('csv-stringify');
var Q = require('q');
var _ = require('lodash');

var carliError = require('../../../CARLI/Error');
var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository');

var PRICING_IMPORT_VERSION = 1;

function exportTemplateForVendorPricingCsv(cycleId, vendorId) {
    var columns = {
        id: 'ID',
        product: 'Product',
        library: 'Library',
        sitePrice: 'Site Price',
        comment: 'Comment'
    };
    var columnOrders = ['product','library'];

    var cycleName = cycleId;

    return cycleRepository.load(cycleId)
        .then(loadAllOfferingsForVendorFromCycle)
        .then(transformIntoCsvData)
        .then(exportToCsv)
        .then(fillInFileName)
        .catch(function(err){
            console.log('CSV ERROR', err);
        });

    function loadAllOfferingsForVendorFromCycle(cycle) {
        cycleName = cycle.name;
        return offeringRepository.listOfferingsForVendorId(vendorId, cycle);
    }

    function transformIntoCsvData(arrayOfExpandedOfferings) {

        var offeringRows = arrayOfExpandedOfferings.map(transformIntoCsvRow);
        var sortedOfferingRows = _.orderBy(offeringRows, columnOrders);

        // return metadataRows().concat(headerRow()).concat(sortedOfferingRows);
        return headerRow().concat(metadataRows()).concat(sortedOfferingRows);

        function metadataRows() {
            return [
                {
                    id: PRICING_IMPORT_VERSION,
                    product: 'importVersion',
                    library: 'INTERNAL USE',
                    sitePrice: '',
                    comment: ''
                },
                {
                    id: cycleId,
                    product: 'cycleId',
                    library: 'INTERNAL USE',
                    sitePrice: '',
                    comment: ''
                },
                {
                    id: vendorId,
                    product: 'vendorId',
                    library: 'INTERNAL USE',
                    sitePrice: '',
                    comment: ''
                }
            ]
        }

        function headerRow() {
            return [columns]
        }

        function transformIntoCsvRow(offering) {
            return {
                id: offering.id,
                product: offering.product.name,
                library: offering.library.name,
                sitePrice: sitePrice(),
                comment: siteComment()
            };

            function sitePrice() {
                return offering.pricing ? offering.pricing.site || '' : '';
            }

            function siteComment() {
                return offering.vendorComments ? offering.vendorComments.site || '' : '';
            }
        }
    }

    function exportToCsv(csvRows) {
        var csvPromise = Q.defer();
        var csvExportOptions = {
            columns: columns
        };

        csvExport(csvRows, csvExportOptions, function (err, output) {
            if (err) {
                csvPromise.reject(err);
            } else {
                csvPromise.resolve(output);
            }
        });

        return csvPromise.promise;
    }

    function fillInFileName(exportedCsv) {
        return vendorRepository.load(vendorId)
            .then(function (vendor) {
                return {
                    csv: exportedCsv,
                    fileName: vendor.name + ' pricing template for ' + cycleName + '.csv'
                };
            });
    }
}

function importFromCsv(cycleId, vendorId, csvRows) {
    var invalidRows = csvRows.filter(isSitePriceInvalid);
    if (invalidRows.length > 0) {
        throw importError('Invalid price', invalidRows);
    }

    var cycle = null;
    var updateTime = new Date().toISOString();

    cycleRepository.load(cycleId)
        .then(saveCycleReference)
        .then(loadOfferingsForVendor)
        .then(mapOfferingsById)
        .then(updateOfferings)
        .then(saveOfferings);

    function saveCycleReference(c) {
        cycle = c;
    }

    function loadOfferingsForVendor() {
        return offeringRepository.listOfferingsForVendorId(vendorId, cycle);
    }

    function mapOfferingsById(offerings) {
        var offeringMap = {};
        offerings.forEach(function (o) {
            offeringMap[o.id] = o;
        });
        return offeringMap;
    }

    function updateOfferings(offeringsById) {
        return csvRows.map(updateOffering);

        function updateOffering(row) {
            var offering = offeringsById[row.id];
            if (!offering)
                throw importError('Offering not found', [ row ]);

            if ( sitePriceIsEmpty(row)) {
                offeringRepository.removeSitePricing(offering);
            }
            else {
                offering.price.site = parseFloat(row.sitePrice).toFixed(2);
            }

            offering.siteLicensePricingUpdate = updateTime;
            offeringRepository.resetFlaggedState(offering);

            if ( row.comment ) {
                offering.vendorComments = offering.vendorComments || {};
                offering.vendorComments.site = row.comment;
            }

            return offering;
        }
    }

    function saveOfferings(offerings) {
        return offeringRepository.bulkUpdateOfferings(offerings, cycle);
    }
}

function importError(message, invalidRows) {
    return carliError({ message: 'Invalid import data: ' + message, invalidRows: invalidRows }, 500);
}

function isSitePriceInvalid(row) {
    return !isSitePriceValid(row);
}

function isSitePriceValid(row) {
    if (sitePriceIsEmpty(row)) {
        return true;
    }
    
    var sitePrice = row.sitePrice.replace(/\$/g, '');
    var sitePriceNumber = parseFloat(sitePrice);
    return !isNaN(sitePriceNumber);
}

function sitePriceIsEmpty(row) {
    return typeof row.sitePrice == 'undefined' || row.sitePrice == null || row.sitePrice == '';
}

module.exports = {
    exportTemplateForVendorPricingCsv: exportTemplateForVendorPricingCsv,
    importFromCsv: importFromCsv
};
