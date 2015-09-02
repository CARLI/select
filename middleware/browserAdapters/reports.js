var middlewareRequest = require('./middlewareRequest');

function selectedProductsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/selected-products/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function contactsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/contacts/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function statisticsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/statistics/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function selectionsByVendorReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/selections-by-vendor/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function totalsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/totals/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function listProductsForVendorReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/list-products-for-vendor/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function contractsReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/contracts/' + reportQuery(reportParameters, reportColumns),
        method: 'get'
    });
}

function productNamesReport(reportParameters, reportColumns) {
    return middlewareRequest({
        path: '/reports/product-names/' + reportQuery(reportParameters, reportColumns),
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
    contactsReport: contactsReport,
    statisticsReport: statisticsReport,
    selectionsByVendorReport: selectionsByVendorReport,
    totalsReport: totalsReport,
    listProductsForVendorReport: listProductsForVendorReport,
    contractsReport: contractsReport,
    productNamesReport: productNamesReport,
    listLibrariesReport: listLibrariesReport
};


function reportQuery( reportParameters, reportColumns ){
    return JSON.stringify(reportParameters) + '/' + JSON.stringify(reportColumns);
}