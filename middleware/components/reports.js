var cycleRepository = require('../../CARLI/Entity/CycleRepository.js');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var Q = require('q');

var columnName = {
    contactType: 'Contact Type',
    cycle: 'Cycle',
    detailCode: 'Detail Code',
    email: 'Email',
    fte: 'FTE',
    institutionType: 'Institution Type',
    institutionYears: 'Years',
    membershipLevel: 'Membership Level',
    name: 'Name',
    isIshareMember: 'I-Share Member',
    isActive: 'Active',
    library: 'Library',
    phoneNumber: 'Phone Number',
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
        ensureResultListsAreInReverseChronologicalCycleOrder(listOfResults);

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
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    console.log('statisticsReport', reportParameters); return Q({ columns: [], data: []});
}

function selectionsByVendorReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    console.log('selectionsByVendorReport', reportParameters); return Q({ columns: [], data: []});
}

function totalsReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    console.log('totalsReport', reportParameters); return Q({ columns: [], data: []});
}

function listProductsForVendorReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    console.log('listProductsForVendorReport', reportParameters); return Q({ columns: [], data: []});
}

function contractsReport( reportParametersStr, userSelectedColumnsStr ){
    var results = [];

    var reportParameters = JSON.parse(reportParametersStr);
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);

    var defaultReportColumns = [];
    var columns = defaultReportColumns.concat(enabledColumns(userSelectedColumns));

    console.log('contractsReport', reportParameters); return Q({ columns: [], data: []});
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

function ensureResultListsAreInReverseChronologicalCycleOrder( listOfListsOfOfferings ){
    listOfListsOfOfferings.sort(reverseChronologicalSortListOfOfferings);

    function reverseChronologicalSortListOfOfferings(listA, listB){
        var yearA = listA[0].cycle.year;
        var yearB = listB[0].cycle.year;

        return yearB - yearA;
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