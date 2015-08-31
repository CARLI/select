var Q = require('q');

function selectedProductsReport( reportParameters, reportColumns ){
    console.log('selected products parameters', reportParameters);
    console.log('selected products columns', reportColumns);

    var results = 'content and stuff';

    return Q(results);
}

module.exports = {
    selectedProductsReport: selectedProductsReport
};