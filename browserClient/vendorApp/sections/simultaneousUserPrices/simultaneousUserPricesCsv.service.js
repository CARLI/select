angular.module('vendor.sections.simultaneousUserPrices')
    .service('simultaneousUserPricesCsvData', simultaneousUserPricesCsvData);

function simultaneousUserPricesCsvData($q) {

    return generateCsv;

    function generateCsv(products, suLevels, pricesBySuLevelByProduct ) {
        var csvData = [];

        var suColumnLabel = 'S.U. Level';
        var columns = [ suColumnLabel ];

        products.forEach(function(product){
            columns.push(product.name);
        });

        suLevels.forEach(function(suLevel){
            var users = suLevel.users;
            var nextRow = {};
            nextRow[suColumnLabel] = users;

            products.forEach(function(product){
                nextRow[product.name] = pricesBySuLevelByProduct[users][product.id];
            });
            csvData.push(nextRow);
        });

        return $q.when(csvData);
    }
}
