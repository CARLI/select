angular.module('carli.sections.reports')
    .service('reportDataService', reportDataService);

function reportDataService( $q, CarliModules ){

    var reportsDataMiddleware = CarliModules.ReportsData;

    var dataFunctionForReportName = {
        'All Pricing': reportsDataMiddleware.allPricingReport,
        'Selected Products': reportsDataMiddleware.selectedProductsReport,
        'Library Contacts': reportsDataMiddleware.contactsReport,
        'Statistics': reportsDataMiddleware.statisticsReport,
        'Selections by Vendor': reportsDataMiddleware.selectionsByVendorReport,
        'Totals': reportsDataMiddleware.totalsReport,
        'List all Products for Vendor': reportsDataMiddleware.listProductsForVendorReport,
        'Contracts': reportsDataMiddleware.contractsReport,
        'Product Names': reportsDataMiddleware.productNamesReport,
        'List Libraries': reportsDataMiddleware.listLibrariesReport,
        'IP Ranges': reportsDataMiddleware.ipRangesReport
    };

    return {
        getDataForReport: getDataForReport
    };

    function getDataForReport( reportName, parameters, columns ){
        var dataFunction =  dataFunctionForReportName[reportName];
        if ( typeof dataFunction !== 'function' ){
            return { error: 'unknown report: ' + reportName };
        }

        return $q.when(dataFunction(parameters, columns))
            .then(function(middlewareResult){
                return middlewareResult.result;
            });
    }
}