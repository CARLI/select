angular.module('vendor.sections.siteLicensePrices')
    .service('siteLicensePricesCsv', siteLicensePricesCsv);

function siteLicensePricesCsv() {

    return generateCsv;

    function generateCsv(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct) {
        var csvData = [];
        var viewOptionColumns = getCsvColumnsFromViewOptions(viewOptions);
        
        var columns = [ 'Library' ];
        columns.concat(viewOptionColumns);
        columns.concat(productsToInclude.map(getName));

        if (viewOptions.priceCap) {
            csvData.push(generateCsvPriceCapRow(viewOptionColumns, productsToInclude));
        }

        librariesToInclude.forEach(function (library) {
            var row = { Library: library.name };
            viewOptionColumns.forEach(function (column) {
                row[column] = getViewOptionValue(library, column);
            });
            var getPrice = makePriceGetter(library);
            row.concat(productsToInclude.map(getPrice));
            csvData.push(row);
        });

        return csvData;

        function makePriceGetter(library) {
            return getPrice;
            function getPrice(product) {
                return offeringsForLibraryByProduct[product.id][library.id];
            }
        }

        function getName(entity) {
            return entity.name;
        }
    }

    function getCsvColumnsFromViewOptions(viewOptions) {
        var columns = [ ];

        if (viewOptions.size) {
            columns.push('Size');
        }
        if (viewOptions.type) {
            columns.push('Type');
        }
        if (viewOptions.years) {
            columns.push('Years');
        }

        return columns;
    }

    function getViewOptionValue(library, column) {
        if (column === 'Size') {
            return library.fte;
        }
        if (column == 'Type') {
            return library.institutionType;
        }
        if (column == 'Years') {
            return library.institutionYears;
        }
    }

    function generateCsvPriceCapRow(emptyColumnsToInclude, productsToInclude) {
        var row = { Library: 'Price Caps' };

        emptyColumnsToInclude.forEach(function(column) {
            row[column] = '';
        });

        productsToInclude.forEach(function (product) {
            row[product.name] = product.priceCap;
        });
    }
}
