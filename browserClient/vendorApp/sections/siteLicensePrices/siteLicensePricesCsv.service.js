angular.module('vendor.sections.siteLicensePrices')
    .service('siteLicensePricesCsvData', siteLicensePricesCsvData);

function siteLicensePricesCsvData($q, CarliModules) {

    return {
        generateSiteLicensePriceCsv: generateSiteLicensePriceCsv
    };

    function generateSiteLicensePriceCsv(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct) {
        return $q.when(CarliModules.VendorCSV.generateSiteLicensePriceCsv(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct));
    }

}
