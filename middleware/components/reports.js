var cycleRepository = require('../../CARLI/Entity/CycleRepository.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var Q = require('q');

var columnName = {
    cycle: 'Cycle',
    detailCode: 'Detail Code',
    library: 'Library',
    price: 'Price',
    product: 'Product',
    selection: 'Selection',
    vendor: 'Vendor'
};

function selectedProductsReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['library', 'cycle', 'product'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(combineCycleResultsForReport)
        .then(fillInVendorNames)
        .thenResolve({
            columns: columnNames(columns),
            data: results
        });

    function getSelectedProductsForEachCycle( listOfCycles ){
        return Q.all( listOfCycles.map(getSelectedProductsForCycle) );

        function getSelectedProductsForCycle( cycle ){
            return offeringRepository.listOfferingsWithSelections(cycle);
        }
    }

    function combineCycleResultsForReport( listOfResults ){
        listOfResults.forEach(addOfferingsToResults);

        function addOfferingsToResults( listOfOfferings ){
            listOfOfferings.forEach(addOfferingToResult);

            function addOfferingToResult( offering ){
                results.push( transformOfferingToResultRow(offering) );
            }
        }

        return results;
    }

    function fillInVendorNames(){
        return collectVendorIds()
            .then(vendorRepository.getVendorsById)
            .then(mapVendorsById)
            .then(replaceVendorIdsWithNames)
            .thenResolve(results);

        function collectVendorIds(){
            return Q(results.map(getVendor));

            function getVendor(row){ return row.vendor; }
        }

        function mapVendorsById(listOfVendors){
            var vendorsById = {};

            listOfVendors.forEach(function(vendor){
                vendorsById[vendor.id] = vendor;
            });

            return vendorsById;
        }

        function replaceVendorIdsWithNames(vendorsById){
            return results.map(function(row){
                row.vendor = vendorsById[row.vendor].name;
            });
        }
    }

    function transformOfferingToResultRow( offering ){
        var row = {
            library: offering.library.name,
            cycle: offering.cycle.name,
            product: offering.product.name
        };

        if ( userSelectedColumns.vendor ){
            row.vendor = offering.product.vendor;
        }

        if ( userSelectedColumns.selection ){
            row.selection = offering.selection.users;
        }

        if ( userSelectedColumns.price ){
            row.price = offering.selection.price;
        }

        if ( userSelectedColumns.detailCode ){
            row.detailCode = offering.product.detailCode || '';
        }

        return row;
    }
}

function enabledColumns(columnDefinitions){
    var columns = [];

    Object.keys(columnDefinitions).forEach(function(columnName){
        if ( columnDefinitions[columnName] ){
            columns.push(columnName);
        }
    });

    return columns;
}

function columnNames( columnList ){
    var results = {};

    columnList.forEach(function(columnKey){
        if ( columnName[columnKey] ) {
            results[columnKey] = columnName[columnKey];
        }
    });

    return results;
}

module.exports = {
    selectedProductsReport: selectedProductsReport
};