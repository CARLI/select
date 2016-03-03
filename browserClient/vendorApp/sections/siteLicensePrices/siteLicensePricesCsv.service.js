angular.module('vendor.sections.siteLicensePrices')
    .service('siteLicensePricesCsvData', siteLicensePricesCsvData);

function siteLicensePricesCsvData($q, CarliModules) {

    return {
        generateSiteLicensePriceCsv: generateSiteLicensePriceCsv,
        generateSiteLicensePriceCsvIncludingLastYear: generateSiteLicensePriceCsvIncludingLastYear
    };

    function generateSiteLicensePriceCsv(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct) {
        return $q.when(CarliModules.VendorCSV.generateSiteLicensePriceCsv(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct));
    }

    function generateSiteLicensePriceCsvIncludingLastYear(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct, currentYear) {
        return $q.when(CarliModules.VendorCSV.generateSiteLicensePriceCsvIncludingLastYear(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct, currentYear));
    }
}
