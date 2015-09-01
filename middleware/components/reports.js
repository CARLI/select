var cycleRepository = require('../../CARLI/Entity/CycleRepository.js');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var Q = require('q');
var _ = require('lodash');

var columnName = {
    averagePrice: 'Average Price',
    contactType: 'Contact Type',
    cycle: 'Cycle',
    detailCode: 'Detail Code',
    email: 'Email',
    fte: 'FTE',
    institutionType: 'Institution Type',
    institutionYears: 'Years',
    membershipLevel: 'Membership Level',
    minPrice: 'Minimum Price',
    name: 'Name',
    numberSelected: 'Number Selected',
    isIshareMember: 'I-Share Member',
    isActive: 'Active',
    library: 'Library',
    license: 'License',
    phoneNumber: 'Phone Number',
    price: 'Price',
    product: 'Product',
    selected: 'Number Selected',
    selection: 'Selection',
    totalPrice: 'Total Price',
    vendor: 'Vendor'
};

function selectedProductsReport( reportParametersStr, userSelectedColumnsStr ){
    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['library', 'cycle', 'product'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(combineCycleResultsForReport(transformOfferingToSelectedProductsResultRow))
        .then(fillInVendorNames)
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function transformOfferingToSelectedProductsResultRow( offering ){
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

function contactsReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    return libraryRepository.listAllContacts()
        .then(function(listOfContacts){
            console.log('got library contacts ', listOfContacts);
            return listOfContacts.map(transformContactToResultRow);
        })
        .then(function(results){
            console.log('contact report results',results);
            return {
                columns: columns,
                data: results
            }
        });

    function transformContactToResultRow( contact ){
        return {
            name: contact.name,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            contactType: contact.contactType
        };
    }
}

function statisticsReport( reportParametersStr, userSelectedColumnsStr ){
    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['cycle', 'vendor', 'product', 'selected'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(combineCycleResultsForReport(transformOfferingToStatisticsReportResultRow))
        .then(fillInVendorNames)
        .then(groupRowsByVendor)
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function transformOfferingToStatisticsReportResultRow( offering ){
        return {
            cycle: offering.cycle.name,
            vendor: offering.product.vendor,
            product: offering.product.name
        };
    }

    function groupRowsByVendor( results ){
        var groupedResults = [];
        var vendorProductCounts = {};

        results.forEach(recordProductCounts);
        Object.keys(vendorProductCounts).forEach(function(cycle){
            var vendors = vendorProductCounts[cycle];

            Object.keys(vendors).forEach(function(vendor){
                var products = vendors[vendor];

                Object.keys(products).forEach(function(product){
                    var count = products[product];
                    groupedResults.push({
                        cycle: cycle,
                        vendor: vendor,
                        product: product,
                        selected: count
                    });
                });
            });
        });
        return groupedResults;

        function recordProductCounts( row ){
            var cycle = row.cycle;
            var vendor = row.vendor;
            var product = row.product;

            vendorProductCounts[cycle] = vendorProductCounts[cycle] || {};
            vendorProductCounts[cycle][vendor] = vendorProductCounts[cycle][vendor] || {};
            vendorProductCounts[cycle][vendor][product] = vendorProductCounts[cycle][vendor][product] || 0;
            vendorProductCounts[cycle][vendor][product]++;
        }
    }
}

function selectionsByVendorReport( reportParametersStr, userSelectedColumnsStr ){
    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['cycle', 'vendor', 'product', 'selection', 'price'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(combineCycleResultsForReport(transformOfferingToSelectionsByVendorResultRow))
        .then(fillInVendorNames)
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function transformOfferingToSelectionsByVendorResultRow( offering ){
        return {
            cycle: offering.cycle.name,
            vendor: offering.product.vendor,
            product: offering.product.name,
            library: offering.library.name,
            selection: offering.selection.users,
            price: offering.selection.price
        };
    }
}

function totalsReport( reportParametersStr, userSelectedColumnsStr ){
    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['cycle', 'numberSelected', 'minPrice', 'totalPrice', 'averagePrice'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(sumOfferingTotals)
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function sumOfferingTotals( listOfListOfOfferingsPerCycle ){
        ensureResultListsAreInReverseChronologicalCycleOrder(listOfListOfOfferingsPerCycle);

        return listOfListOfOfferingsPerCycle.map(sumCycleTotals);

        function sumCycleTotals(listOfOfferingsForCycle) {
            var cycle = listOfOfferingsForCycle[0].cycle;

            var result = {
                cycle: cycle.name,
                numberSelected: listOfOfferingsForCycle.length,
                minPrice: Infinity,
                totalPrice: 0,
                averagePrice: 0
            };

            listOfOfferingsForCycle.forEach(sumPricesAndFindMinimumPrice);

            result.minPrice = result.minPrice.toFixed(2);
            result.totalPrice = result.totalPrice.toFixed(2);
            result.averagePrice = (result.totalPrice / result.numberSelected).toFixed(2);

            return result;

            function sumPricesAndFindMinimumPrice(offering) {
                var price = offering.selection.price;

                result.totalPrice += price;

                if ( price < result.minPrice ){
                    result.minPrice = price;
                }
            }
        }
    }
}

function listProductsForVendorReport( reportParametersStr, userSelectedColumnsStr ){
    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['cycle', 'vendor', 'product'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getOfferedProductsForEachCycle)
        .then(combineCycleResultsForReport(transformProductToResultRow))
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function transformProductToResultRow(product){
        return {
            cycle: product.cycle.name,
            vendor: product.vendor.name,
            product: product.name
        };
    }
}

function contractsReport( reportParametersStr, userSelectedColumnsStr ){
    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = ['cycle', 'vendor', 'product', 'license'];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    var cyclesToQuery = reportParameters.cycle;

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getOfferedProductsForEachCycle)
        .then(combineCycleResultsForReport(transformProductToResultRow))
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function transformProductToResultRow(product){
        return {
            cycle: product.cycle.name,
            vendor: product.vendor.name,
            product: product.name,
            license: product.license ? product.license.name : ''
        };
    }
}

function productNamesReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    console.log('productNamesReport', reportParameters); return Q({ columns: [], data: []});
}

function listLibrariesReport( reportParametersStr, userSelectedColumnsStr ){
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);
    var enabledUserSelectedColumns = enabledColumns(userSelectedColumns);

    var defaultReportColumns = ['name'];
    var columns = defaultReportColumns.concat(userSelectedColumns);

    return libraryRepository.list()
        .then(function(allLibraries){
            return allLibraries.map(transformLibraryToResultRow)
        })
        .then(function(results) {
            return {
                columns: columnNames(columns),
                data: results
            };
        });

    function transformLibraryToResultRow( library ){
        var result = {
            name: library.name
        };

        enabledUserSelectedColumns.forEach(function(column){
            result[column] = library[column];
        });

        if ( userSelectedColumns.isIshareMember ) {
            if ('isIshareMember' in library) {
                result.isIshareMember = !!library.isIshareMember ? 'yes' : 'no';
            }
            else {
                result.isIshareMember = '';
            }
        }

        if ( userSelectedColumns.isActive ) {
            if ('isActive' in library) {
                result.isActive = !!library.isActive ? 'yes' : 'no';
            }
            else {
                result.isActive = '';
            }
        }

        return result;
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

function getSelectedProductsForEachCycle( listOfCycles ){
    return Q.all( listOfCycles.map(getSelectedProductsForCycle) );

    function getSelectedProductsForCycle( cycle ){
        return offeringRepository.listOfferingsWithSelections(cycle);
    }
}

function getOfferedProductsForEachCycle( listOfCycles ) {
    return Q.all( listOfCycles.map(getProductsForCycle) );

    function getProductsForCycle(cycle) {
        return productRepository.list(cycle)
    }
}

function combineCycleResultsForReport( transformFunction ){

    return function( listOfListOfOfferingsPerCycle ) {
        var results = [];

        ensureResultListsAreInReverseChronologicalCycleOrder(listOfListOfOfferingsPerCycle);

        listOfListOfOfferingsPerCycle.forEach(addOfferingsToResults);

        function addOfferingsToResults(listOfOfferings) {
            listOfOfferings.forEach(addOfferingToResult);

            function addOfferingToResult(offering) {
                results.push(transformFunction(offering));
            }
        }

        return results;
    }
}

function ensureResultListsAreInReverseChronologicalCycleOrder( listOfListsOfOfferings ){
    listOfListsOfOfferings.sort(reverseChronologicalSortListOfOfferings);

    function reverseChronologicalSortListOfOfferings(listA, listB){
        var yearA = listA[0].cycle.year;
        var yearB = listB[0].cycle.year;

        return yearB - yearA;
    }
}

function fillInVendorNames(results){
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