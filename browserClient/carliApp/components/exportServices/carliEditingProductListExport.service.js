angular.module('carli.exportServices')
    .factory('carliEditingProductListExport', carliEditingProductListExport);

function carliEditingProductListExport($q, csvExportService) {
    return exportProductList;

    function exportProductList(vendor, cycle, yearsToExport) {
        var exportFilename = cycle.name + ' - ' + vendor.name + '.csv';
        var exportHeaders = getExportHeaders();
        var productFundingTodo = '';

        return gatherData()
            .then(generateExport)
            .then(downloadExport);

        function gatherData() {
            return $q.when(vendor.products.map(getExportRow));
        }
        function generateExport(data) {
            return csvExportService.exportToCsv(data, exportHeaders);
        }
        function downloadExport(csvString) {
            return csvExportService.browserDownloadCsv(csvString, exportFilename);
        }

        function getExportHeaders() {
            return [ 'Product' ].concat( yearsToExport ).concat([ 'Last Price', 'Funding' ]);
        }
        function getExportRow(product) {
            return [ product.name ].concat( getSelectionHistory() ).concat([ product.pricingLastYear, productFundingTodo ]);

            function getSelectionHistory() {
                return yearsToExport.map(getHistoricalDescription);

                function getHistoricalDescription(year) {
                    var description = 'unknown';
                    product.historicalPricing.forEach(function(history) {
                        if (history.year === year) {
                            description = history.description;
                        }
                    });
                    return description;
                }
            }
        }
    }
}
