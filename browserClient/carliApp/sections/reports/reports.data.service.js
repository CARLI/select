angular.module('carli.sections.reports')
    .service('reportDataService', reportDataService);

function reportDataService( libraryService ){
    var dataFunctionForReportName = {
        'Selected Products': dataForSelectedProducts,
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
        return dataFunction(parameters, columns);
    }

    function dataForSelectedProducts(parameters, columns){
        console.log('selected products parameters', parameters);
        console.log('selected products columns', columns);

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