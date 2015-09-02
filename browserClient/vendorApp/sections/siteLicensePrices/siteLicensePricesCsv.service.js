angular.module('vendor.sections.siteLicensePrices')
    .service('siteLicensePricesCsvData', siteLicensePricesCsvData);

function siteLicensePricesCsvData($q) {

    return generateCsv;

    function generateCsv(viewOptions, productsToInclude, librariesToInclude, offeringsForLibraryByProduct) {
        var csvData = [];
        var viewOptionColumns = getCsvColumnsFromViewOptions(viewOptions);
        
        var columns = [ 'Library' ];
        columns = columns.concat(viewOptionColumns);
        columns = columns.concat(productsToInclude.map(getName));

        //csvData.push(generateHeaderRow());

        if (viewOptions.priceCap) {
            csvData.push(generateCsvPriceCapRow(viewOptionColumns, productsToInclude));
        }

        librariesToInclude.forEach(generateRowForLibrary);

        return $q.when(csvData);


        function getName(entity) {
            return entity.name;
        }

        function generateHeaderRow() {
            var row = {};
            columns.forEach(function (column) {
                row[column] = column;
            });
            return row;
        }

        function generateRowForLibrary(library) {
            var offerings = productsToInclude.map(getOffering);
            var row = { Library: library.name };

            viewOptionColumns.forEach(addViewOptionColumn);
            offerings.forEach(addPriceColumn);
            csvData.push(row);

            function getOffering(product) {
                var offering = offeringsForLibraryByProduct[product.id][library.id] || makeNullOffering(product);
                var result = {
                    product: copyOfferingProduct(),
                    pricing: offering.pricing
                };

                function copyOfferingProduct(){
                    return  {
                        id: product.id,
                        name: product.name
                    };
                }

                return result;
            }
            function addViewOptionColumn(column) {
                row[column] = getViewOptionValue(library, column);
            }
            function addPriceColumn(offering) {
                row[offering.product.name] = offering.pricing.site;
            }
        }

        function makeNullOffering(product) {
            return {
                product: product,
                pricing: { site: 0 }
            };
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

        return row;
    }
}
