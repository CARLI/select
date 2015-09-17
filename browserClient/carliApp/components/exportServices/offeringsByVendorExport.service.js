angular.module('carli.exportServices')
    .factory('offeringsByVendorExport', offeringsByVendorExport);

function offeringsByVendorExport($q, csvExportService, offeringsExportHelper) {
    var suOfferingsByYearLookupCache = {};

    return exportOfferingList;

    function exportOfferingList(vendor, cycle, offeringColumns) {
        var exportHelper = offeringsExportHelper(cycle, vendorOfferingsIterator);

        var exportFilename = cycle.name + ' - ' + vendor.name + '.csv';
        var exportHeaders = getExportHeaders();

        return gatherData()
            .then(generateExport)
            .then(downloadExport)
            .then(resetCache);

        function gatherData() {
            var groupsOfRows = vendor.products.map(getExportRowsForProduct);
            return $q.when(groupsOfRows.reduce(flattenArrays));
        }
        function generateExport(data) {
            return csvExportService.exportToCsv(data, exportHeaders);
        }
        function downloadExport(csvString) {
            return csvExportService.browserDownloadCsv(csvString, exportFilename);
        }
        function resetCache(o) {
            suOfferingsByYearLookupCache = {};
            return o;
        }

        function getExportHeaders() {
            return [ 'Product' ].concat( getExportColumnsForOfferingColumns() );

            function getExportColumnsForOfferingColumns() {
                var exportColumns = offeringColumns.map(exportHelper.getExportHeadersForOfferingColumn);
                return exportColumns.reduce(flattenArrays);
            }
        }
        function getExportRowsForProduct(product) {
            return product.offerings.map(getExportRow);
        }
        function getExportRow(offering) {
            return [ offering.product.name ].concat( getExportRowForOfferingColumns() );

            function getExportRowForOfferingColumns() {
                var exportColumns = offeringColumns.map(function (offeringColumn) {
                    return exportHelper.getExportRowForOfferingColumn(offering, offeringColumn);
                });
                return exportColumns.reduce(flattenArrays);
            }
        }

        function flattenArrays(a, b) {
            return a.concat(b);
        }

        function vendorOfferingsIterator(iterate) {
            vendor.products.forEach(function (product) {
                product.offerings.forEach(iterate);
            });
        }
    }
}
