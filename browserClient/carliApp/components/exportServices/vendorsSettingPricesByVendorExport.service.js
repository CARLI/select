angular.module('carli.exportServices')
    .factory('vendorsSettingPricesByVendorExport', vendorsSettingPricesByVendorExport);

function vendorsSettingPricesByVendorExport($q, csvExportService) {
    return exportOfferingList;

    function exportOfferingList(vendor, cycle, offeringColumns) {
        var exportFilename = cycle.name + ' - ' + vendor.name + '.csv';
        var exportHeaders = getExportHeaders();

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
            return [ 'Product' ].concat( getExportColumnsForOfferingColumns() );

            function getExportColumnsForOfferingColumns() {
                var exportColumns = offeringColumns.map(getExportHeadersForOfferingColumn);
                return exportColumns.reduce(flattenArrays);
            }
        }
        function getExportRow(product) {
            return [ product.name ].concat( getExportRowForOfferingColumns() );

            function getExportRowForOfferingColumns() {
                return [];
            }
        }

        function flattenArrays(a, b) {
            return a.concat(b);
        }

        // --- extract to generic service for all of the subscription screens
        function getExportHeadersForOfferingColumn(offeringColumn) {
            var exportColumns = null;

            switch (offeringColumn) {
                case 'library':
                    exportColumns = [ 'Library', 'Size', 'Institution Years', 'Institution Type' ];
                    break;
                case 'library-view':
                    exportColumns = [ 'Display Mode', 'Internal Comments', 'Comments for Libraries' ];
                    break;
                case 'site-license-price-both':
                    exportColumns = getExportHeadersForPricingForYear(cycle.year - 1);
                    exportColumns = exportColumns.concat( getExportHeadersForPricingForYear(cycle.year) );
                    break;
                case 'flag':
                    exportColumns = [ 'Flag' ];
                    break;
                default:
                    exportColumns = [];
            }

            return exportColumns;
        }

        function getExportHeadersForPricingForYear(year) {
            return [ year + ' Site Pricing' ].concat(lookupSuOfferingsForYear());

            function lookupSuOfferingsForYear() {
                var suList = [];

                forEachOffering(addSuPriceHeaderForOffering);

                suList.sort();
                return suList.map(formatHeader);

                function forEachOffering(iterate) {
                    vendor.products.forEach(function (product) {
                        product.offerings.forEach(iterate);
                    });
                }

                function addSuPriceHeaderForOffering(offering) {
                    var pricingObject = getPricingObjectFromOfferingForYear(offering, year);
                    pricingObject.su.forEach(addSuToList);
                }

                function addSuToList(suPricing) {
                    if (suList.indexOf(suPricing.users) === -1) {
                        suList.push(suPricing.users);
                    }
                }

                function formatHeader(suUsers) {
                    return year + ' ' + suUsers + ' User Pricing';
                }
            }
        }

        function getPricingObjectFromOfferingForYear(offering, year) {
            var pricingObject = { su: {} };
            if (cycle.year == year) {
                pricingObject = offering.pricing;
            } else if (offering.history.hasOwnProperty(year)) {
                pricingObject = offering.history[year].pricing;
            }
            return pricingObject;
        }
        // ---
    }
}
