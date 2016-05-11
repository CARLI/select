
var csvExport = require('csv-stringify');
var csvParse = require('csv-parse');
var Q = require('q');
var _ = require('lodash');

var carliError = require('../../../CARLI/Error');
var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository');

var PRICING_IMPORT_VERSION = 1;

var columns = {
    id: 'ID',
    product: 'Product',
    library: 'Library',
    sitePrice: 'Site Price',
    comment: 'Comment'
};

function exportTemplateForVendorPricingCsv(cycleId, vendorId) {
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

function csvParsePromise(data, options, callback) {
    var deferred = Q.defer();

    csvParse(data, options, function (error, parsedContent) {
        if (error)
            deferred.reject(error);
        else
            deferred.resolve(parsedContent);
    });

    return deferred.promise;
}

function parseCsvInput(requestBody) {
    return csvParsePromise(requestBody, { columns: true })
        .then(transformLabelsToProperties)
        .then(function (parsedContent) {
            var importMetadata = getImportMetadata(parsedContent);

            if (importMetadata.importVersion != 1) {
                console.log('Invalid import version', importMetadata);
                throw carliError('Invalid import version');
            }

            return {
                metadata: importMetadata,
                content: parsedContent.filter(removeMetaDataRows)
            };

            function removeMetaDataRows(row) {
                return row.library != 'INTERNAL USE';
            }
        });

    // The CSV object uses labels as the property names, change them back to the original property names.
    function transformLabelsToProperties(objectsWithLabels) {
        var columnKeys = Object.keys(columns);
        return objectsWithLabels.map(function (oldObject) {
            var newObject = {};
            columnKeys.forEach(function (key) {
                var label = columns[key];
                newObject[key] = oldObject[label];
            });
            return newObject;
        });
    }

    function getImportMetadata(rows) {
        var importMetadata = {
            importVersion: null,
            cycleId: null,
            vendorId: null
        };
        rows.forEach(function (row) {
            if (row.product == 'importVersion')
                importMetadata.importVersion = row.id;
            else if (row.product == 'cycleId')
                importMetadata.cycleId = row.id;
            else if (row.product == 'vendorId')
                importMetadata.vendorId = row.id;
        });
        if (importMetadata.importVersion == null || importMetadata.cycleId == null || importMetadata.vendorId == null) {
            throw new carliError('Import metadata not found');
        }
        return importMetadata;
    }
}

function importFromCsv(cycleId, vendorId, csvRows) {
    var cycle = null;
    var updateTime = new Date().toISOString();

    return cycleRepository.load(cycleId)
        .then(saveCycleReference)
        .then(checkForInvalidPrices)
        .then(loadOfferingsForVendor)
        .then(mapOfferingsById)
        .then(updateOfferings)
        .then(saveOfferings);

    function saveCycleReference(c) {
        cycle = c;
        return cycle;
    }

    function checkForInvalidPrices() {
        var invalidRows = csvRows.filter(isSitePriceInvalid);
        if (invalidRows.length > 0) {
            Logger.log('Rejected pricing upload due to invalid rows', invalidRows);
            throw importError('Invalid price', invalidRows);
        }
        return true;
    }

    function loadOfferingsForVendor() {
        Logger.log('Loading offerings for pricing import');
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
        Logger.log('Updating prices with uploaded data for loaded offerings');
        Logger.log('There are ' + csvRows.length + ' uploaded rows');
        return csvRows.map(updateOffering);

        function updateOffering(row) {
            var offering = offeringsById[row.id];
            if (!offering) {
                Logger.log('Rejected pricing upload due to missing row', row);
                throw importError('Offering not found', [ row ]);
            }

            if ( sitePriceIsEmpty(row)) {
                offeringRepository.removeSitePricing(offering);
            }
            else {
                // parseFloat().toFixed() -> string
                offering.pricing.site = parseFloat(parseFloat(row.sitePrice).toFixed(2));
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
        Logger.log('Saving back updated offerings');
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
    parseCsvInput: parseCsvInput,
    importFromCsv: importFromCsv
};
