angular.module('carli.exportServices')
    .factory('offeringsByLibraryExport', offeringsByLibraryExport);

function offeringsByLibraryExport($q, csvExportService, offeringsExportHelper) {
    return exportOfferingList;

    function exportOfferingList(library, vendorMap, offerings, cycle, offeringColumns) {
        var exportHelper = offeringsExportHelper(cycle, libraryOfferingsIterator);

        var exportFilename = cycle.name + ' - ' + library.name + '.csv';
        var exportHeaders = getExportHeaders();

        return gatherData()
            .then(generateExport)
            .then(downloadExport)
            .then(resetCache);

        function gatherData() {
            var rows = offerings.map(getExportRow);
            return $q.when(rows);
            //return $q.when(rows.reduce(flattenArrays));
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
            return getExportColumnsForOfferingColumns();

            function getExportColumnsForOfferingColumns() {
                var exportColumns = offeringColumns.map(exportHelper.getExportHeadersForOfferingColumn);
                return exportColumns.reduce(flattenArrays);
            }
        }
        function getExportRow(offering) {
            return getExportRowForOfferingColumns();

            function getExportRowForOfferingColumns() {
                var exportColumns = offeringColumns.map(function (offeringColumn) {
                    return exportHelper.getExportRowForOfferingColumn(offering, offeringColumn, vendorMap);
                });
                return exportColumns.reduce(flattenArrays);
            }
        }

        function flattenArrays(a, b) {
            return a.concat(b);
        }

        function libraryOfferingsIterator(iterate) {
            offerings.forEach(iterate);
        }
    }
}
