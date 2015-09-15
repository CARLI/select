angular.module('carli.exportServices')
    .factory('vendorsSettingPricesByVendorExport', vendorsSettingPricesByVendorExport);

function vendorsSettingPricesByVendorExport($q, csvExportService) {
    var suOfferingsByYearLookupCache = {};

    return exportOfferingList;


    function exportOfferingList(vendor, cycle, offeringColumns) {
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
                var exportColumns = offeringColumns.map(getExportHeadersForOfferingColumn);
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
                    return getExportRowForOfferingColumn(offering, offeringColumn)
                });
                return exportColumns.reduce(flattenArrays);
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
            return [ year + ' Site Pricing' ].concat(lookupSuOfferingsForYear(year).map(formatHeader));

            function formatHeader(suUsers) {
                return year + ' ' + suUsers + ' User Pricing';
            }
        }

        function getExportRowForOfferingColumn(offering, offeringColumn) {
            var exportColumns = null;

            switch (offeringColumn) {
                case 'library':
                    exportColumns = [ offering.library.name,
                        offering.library.size,
                        offering.library.institutionYears,
                        offering.library.institutionType
                    ];
                    break;
                case 'library-view':
                    exportColumns = [
                        offering.display,
                        offering.internalComments,
                        offering.libraryComments
                    ];
                    break;
                case 'site-license-price-both':
                    exportColumns = getExportDataForPricingForYear(offering, cycle.year - 1);
                    exportColumns = exportColumns.concat( getExportDataForPricingForYear(offering, cycle.year) );
                    break;
                case 'flag':
                    exportColumns = [ offering.flagged ];
                    break;
                default:
                    exportColumns = [];
            }

            return exportColumns;
        }

        function getExportDataForPricingForYear(offering, year) {
            var pricing = getPricingFromOfferingForYear(offering, year);

            return [ pricing.site ].concat(lookupSuOfferingsForYear(year).map(getPriceForUsers));

            function getPriceForUsers(suUsers) {
                var price = '';
                pricing.su.forEach(function (suPricing) {
                    if (suPricing.users === suUsers) {
                        price = suPricing.price;
                    }
                });
                return price;
            }
        }

        function lookupSuOfferingsForYear(year) {
            if (suOfferingsByYearLookupCache[year]) {
                return suOfferingsByYearLookupCache[year];
            }

            var suList = [];

            forEachOffering(addSuForOffering);

            suList.sort();
            suOfferingsByYearLookupCache[year] = suList;
            return suList;

            function forEachOffering(iterate) {
                vendor.products.forEach(function (product) {
                    product.offerings.forEach(iterate);
                });
            }

            function addSuForOffering(offering) {
                var pricing = getPricingFromOfferingForYear(offering, year);
                pricing.su.forEach(addSuToList);
            }

            function addSuToList(suPricing) {
                if (suList.indexOf(suPricing.users) === -1) {
                    suList.push(suPricing.users);
                }
            }
        }

        function getPricingFromOfferingForYear(offering, year) {
            var pricing = { su: {} };
            if (cycle.year == year) {
                pricing = offering.pricing;
            } else if (offering.history.hasOwnProperty(year)) {
                pricing = offering.history[year].pricing;
            }
            return pricing;
        }
        // ---
    }
}
