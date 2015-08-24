angular.module('vendor.sections.simultaneousUserPrices')
    .service('simultaneousUserPricesCsv', simultaneousUserPricesCsv);

function simultaneousUserPricesCsv($q, CarliModules) {

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

        console.log('export ',columns, csvData);

        var csvExportOptions = {
            columns: columns,
            header: true
        };

        var deferred = $q.defer();
        CarliModules.Csv.stringify(csvData, csvExportOptions, function(err, out) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(out);
            }
        });
        return deferred.promise;
    }
}
