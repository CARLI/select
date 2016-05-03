var csvExport = require('csv-stringify');
var cycleRepository = require('../../../CARLI/Entity/CycleRepository');
var offeringRepository = require('../../../CARLI/Entity/OfferingRepository');
var Q = require('q');
var vendorRepository = require('../../../CARLI/Entity/VendorRepository');
var _ = require('lodash');

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

        return dataRows().concat(headerRow()).concat(sortedOfferingRows);

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

module.exports = {
    exportTemplateForVendorPricingCsv: exportTemplateForVendorPricingCsv
};
