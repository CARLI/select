var middlewareRequest = require('./middlewareRequest');

function selectedProductsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/selected-products/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

module.exports = {
    selectedProductsReport: selectedProductsReport
};


function reportQuery( reportParameters, reportColumns ){
    return JSON.stringify(reportParameters) + '/' + JSON.stringify(reportColumns);
}