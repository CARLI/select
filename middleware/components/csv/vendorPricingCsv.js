var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository');
var Q = require('q');
var csvExport = require('csv-stringify');

function exportTemplateForVendorPricingCsv(cycleId, vendorId) {
    var columns = {
        id: 'ID',
        product: 'Product',
        library: 'Library',
        sitePrice: 'Site Price',
        comment: 'Comment'
    };

    return cycleRepository.load(cycleId)
        .then(loadAllOfferingsForVendorFromCycle)
        .then(transformIntoCsvData)
        .then(returnExportResults);

    function loadAllOfferingsForVendorFromCycle(cycle) {
        return offeringRepository.listOfferingsForVendorId(vendorId, cycle);
    }

    function transformIntoCsvData(arrayOfExpandedOfferings) {

        var offeringRows = arrayOfExpandedOfferings.map(transformIntoCsvRow);
        return dataRows().concat(headerRow()).concat(offeringRows);

        function dataRows() {
            return [
                {
                    id: 'CycleId',
                    product: cycleId
                },
                {
                    id: 'VendorId',
                    product: vendorId
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

    function returnExportResults(csvRows) {
        var csvPromise = Q.defer();
        var csvExportOptions = {
            columns: columns
        };

        csvExport(csvRows, csvExportOptions, function (err, output) {
            if (err) {
                csvPromise.reject(err);
            } else {
                csvPromise.resolve({
                    csv: output,
                    fileName: 'Some Vendor Pricing.csv'
                });
            }
        });

        return csvPromise.promise;
    }
}

module.exports = {
    exportTemplateForVendorPricingCsv: exportTemplateForVendorPricingCsv
};
