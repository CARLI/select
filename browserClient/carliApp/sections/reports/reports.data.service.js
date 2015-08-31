angular.module('carli.sections.reports')
    .service('reportDataService', reportDataService);

function reportDataService( CarliModules ){

    var reportsDataMiddleware = CarliModules.ReportsData;

    var dataFunctionForReportName = {
        'Selected Products': reportsDataMiddleware.selectedProductsReport,
        'Contacts': dataForContacts,
        'Statistics': dataForStatistics,
        'Selections by Vendor': dataForSelectionsByVendor,
        'Totals': dataForTotals,
        'List all Products for Vendor': dataForListProductsForVendor,
        'Contracts': dataForContracts,
        'Product Names': dataForProductNames,
        'List Libraries': dataForListLibraries
    };

    return {
        getDataForReport: getDataForReport
    };

    function getDataForReport( reportName, parameters, columns ){
        var dataFunction =  dataFunctionForReportName[reportName];
        if ( typeof dataFunction !== 'function' ){
            return { error: 'unknown report: ' + reportName };
        }

        return dataFunction(parameters, columns)
            .then(function(middlewareResult){
                return middlewareResult.result;
            });
    }

    function dataForContacts(parameters, columns){

    }

    function dataForStatistics(parameters, columns){

    }

    function dataForSelectionsByVendor(parameters, columns){

    }

    function dataForTotals(parameters, columns){

    }

    function dataForListProductsForVendor(parameters, columns){

    }

    function dataForContracts(parameters, columns){

    }

    function dataForProductNames(parameters, columns){

    }

    function dataForListLibraries(parameters, columns){
        console.log('list libraries parameters', parameters);
        console.log('list libraries columns', columns);
    }
}