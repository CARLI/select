var middlewareRequest = require('./middlewareRequest');

function selectedProductsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/selected-products/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function listLibrariesReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/list-libraries/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

module.exports = {
    selectedProductsReport: selectedProductsReport,
    listLibrariesReport: listLibrariesReport
};


function reportQuery( reportParameters, reportColumns ){
    return JSON.stringify(reportParameters) + '/' + JSON.stringify(reportColumns);
}