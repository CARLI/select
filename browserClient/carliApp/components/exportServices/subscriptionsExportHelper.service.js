angular.module('carli.exportServices')
    .factory('subscriptionsExportHelper', subscriptionsExportHelper);

function subscriptionsExportHelper() {
    var suOfferingsByYearLookupCache = {};

    return createHelperWithIterator;

    function createHelperWithIterator(cycle, offeringsIterator) {
        return {
            getExportHeadersForOfferingColumn: getExportHeadersForOfferingColumn,
            getExportRowForOfferingColumn: getExportRowForOfferingColumn
        };

        function getExportHeadersForOfferingColumn(offeringColumn) {
            var exportColumns = null;

            switch (offeringColumn) {
                case 'product':
                    exportColumns = [ 'Product' ];
                    break;
                case 'vendor':
                    exportColumns = [ 'Vendor' ];
                    break;
                case 'library':
                    exportColumns = [ 'Library', 'Size', 'Institution Years', 'Institution Type' ];
                    break;
                case 'library-view':
                    exportColumns = [ 'Display Mode', 'Internal Comments', 'Comments for Libraries' ];
                    break;
                case 'site-license-price-both':
                    exportColumns = getExportHeadersForPricingForYear(cycle.year - 1);
                    exportColumns = exportColumns.concat(getExportHeadersForPricingForYear(cycle.year));
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

        function getExportRowForOfferingColumn(offering, offeringColumn, vendorMap) {
            var exportColumns = null;

            switch (offeringColumn) {
                case 'product':
                    exportColumns = [ offering.product.name ];
                    break;
                case 'vendor':
                    exportColumns = [ vendorMap[offering.vendorId].name ];
                    break;
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
                    exportColumns = exportColumns.concat(getExportDataForPricingForYear(offering, cycle.year));
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
            if (suOfferingsByYearLookupCache[ year ]) {
                return suOfferingsByYearLookupCache[ year ];
            }

            var suList = [];

            offeringsIterator(addSuForOffering);

            suList.sort();
            suOfferingsByYearLookupCache[ year ] = suList;
            return suList;

            function addSuForOffering(offering) {
                var pricing = getPricingFromOfferingForYear(offering, year);
                if (pricing.su) {
                    pricing.su.forEach(addSuToList);
                }
            }

            function addSuToList(suPricing) {
                if (suList.indexOf(suPricing.users) === -1) {
                    suList.push(suPricing.users);
                }
            }
        }

        function getPricingFromOfferingForYear(offering, year) {
            var pricing = { };
            if (cycle.year == year) {
                pricing = offering.pricing;
            } else if (offering.history && offering.history.hasOwnProperty(year)) {
                pricing = offering.history[ year ].pricing;
            }
            return pricing;
        }
    }
}
