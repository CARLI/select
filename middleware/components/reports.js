var cycleRepository = require('../../CARLI/Entity/CycleRepository.js');
var libraryRepository = require('../../CARLI/Entity/LibraryRepository.js');
var licenseRepository = require('../../CARLI/Entity/LicenseRepository.js');
var offeringRepository = require('../../CARLI/Entity/OfferingRepository.js');
var productRepository = require('../../CARLI/Entity/ProductRepository.js');
var vendorRepository = require('../../CARLI/Entity/VendorRepository.js');
var Q = require('q');
var _ = require('lodash');

var columnName = {
    address: 'Address',
    averagePrice: 'Average Price',
    city: 'City',
    contactType: 'Contact Type',
    cycle: 'Cycle',
    detailCode: 'Detail Code',
    email: 'Email',
    fte: 'FTE',
    institutionType: 'Institution Type',
    institutionYears: 'Years',
    isActive: 'Active',
    isIshareMember: 'I-Share Member',
    library: 'Library',
    license: 'License',
    membershipLevel: 'Membership Level',
    minPrice: 'Minimum Price',
    name: 'Name',
    numberSelected: 'Number Selected',
    phoneNumber: 'Phone Number',
    price: 'Price',
    product: 'Product',
    selected: 'Number Selected',
    selection: 'Selection',
    sitePrice: 'Site License Price',
    state: 'State',
    totalPrice: 'Total Price',
    type: 'Type',
    vendor: 'Vendor',
    zip: 'Zip'
};

function allPricingReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'vendor', 'product', 'library', 'license', 'sitePrice'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters) || [];
    var vendorsParameter = getVendorParameter(reportParameters) || [];
    var productsParameter = getProductParameter(reportParameters) || [];
    var librariesParameter = getLibraryParameter(reportParameters) || [];

    var productsToInclude = productsParameter || [];
    var shouldFilterIncludedProducts = false;
    var shouldFilterIncludedLibraries = librariesParameter.length;

    var suPricingColumns = {};

    console.log('allPricingReport for ' + cyclesToQuery.length + ' cycles, ' + productsToInclude.length + ' products, and ' + librariesParameter.length + ' libraries');

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(decideWhichProductsToInclude)
        .then(getOfferingsForAllCycles)
        .then(filterResultsForProductsToInclude)
        .then(combineCycleResultsForReport(transformOfferingToPricingResultRow))
        .then(logData)
        .then(function(data){
            var allColumns = columns.concat(Object.keys(suPricingColumns));
            return returnReportResults(allColumns)(data);
        })
        .catch(stackTraceError);

    function decideWhichProductsToInclude(cycles) {
        if (productsParameter.length) {
            return Q(productsParameter)
                .then(saveProductsToInclude)
                .thenResolve(cycles);
        }
        else {
            return Q.all(cycles.map(getProductsForVendorsForCycle))
                .then(reduceToListOfUniqueProducts)
                .then(saveProductsToInclude)
                .thenResolve(cycles);

            function getProductsForVendorsForCycle(cycle) {
                return productRepository.listActiveProductIdsForVendorIds(vendorsParameter, cycle);
            }

            function reduceToListOfUniqueProducts(arrayOfProductIdsPerCycle){
                return _.uniq(_.flattenDeep(arrayOfProductIdsPerCycle));
            }
        }

        function saveProductsToInclude(listOfProductIds) {
            productsToInclude = listOfProductIds;
            shouldFilterIncludedProducts = productsToInclude.length;
        }
    }

    function getOfferingsForAllCycles(listOfCycles) {

        if (shouldFilterIncludedLibraries) {
            return Q.all(listOfCycles.map(getOfferingsForCycleForLibraries));
        }
        else {
            return Q.all(listOfCycles.map(getOfferingsForCycle));
        }

        function getOfferingsForCycleForLibraries(cycle) {
            return offeringRepository.listOfferingsForLibraryIdUnexpanded(librariesParameter, cycle)
                .then(fillInCycle(cycle))
                .then(fillInProducts(cycle))
                .then(fillInLibraries)
                .then(attachVendorToOfferings)
                .then(filterOfferingsForActiveEntities);
        }

        function getOfferingsForCycle(cycle) {
            return offeringRepository.listOfferingsUnexpanded(cycle)
                .then(fillInCycle(cycle))
                .then(fillInProducts(cycle))
                .then(fillInLibraries)
                .then(attachVendorToOfferings)
                .then(filterOfferingsForActiveEntities);
        }

        function filterOfferingsForActiveEntities(offerings) {
            return offerings.filter(function(offering) {
                return offering.product.isActive &&
                       offering.library.isActive &&
                       offering.vendor.isActive;
            });
        }
    }

    function filterResultsForProductsToInclude(listOfListOfOfferingsPerCycle) {
        if ( shouldFilterIncludedProducts ) {
            return listOfListOfOfferingsPerCycle.map(filterOfferingsForIncludedProducts);
        }
        else {
            return listOfListOfOfferingsPerCycle;
        }

        function filterOfferingsForIncludedProducts(listOfOfferings) {
            return listOfOfferings.filter(function (offering) {
                var productId = offering.product.id || offering.product;
                return productsToInclude.indexOf(productId) >= 0;
            });
        }
    }

    function transformOfferingToPricingResultRow(offering) {
        var row = {
            cycle: offering.cycle.name,
            vendor: offering.vendor.name,
            product: offering.product.name,
            library: offering.library.name,
            license: licenseName(offering),
            sitePrice: offeringRepository.getFundedSiteLicensePrice(offering) || ' '
        };

        var suPricing = offering.pricing.su;
        if (suPricing && suPricing.length) {
            suPricing.forEach(function(suPrice) {
                addSuPriceToRow(suPrice);
                addSuPriceToColumns(suPrice);
            });
        }

        return row;

        function addSuPriceToRow(suPrice) {
            row[suPriceColumnKey(suPrice)] = suPrice.price;
        }

        function addSuPriceToColumns(suPrice) {
            suPricingColumns[suPriceColumnKey(suPrice)] = suPriceColumnKey(suPrice);
        }

        function suPriceColumnKey(suPrice) {
            return suPrice.users + ' Users'
        }
    }
}

function selectedProductsReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'library', 'license', 'vendor', 'product', 'selection', 'price'];
    var vendorsParameter = getVendorParameter(reportParameters) || [];
    var licensesParameter = getLicenseParameter(reportParameters) || [];
    var librariesParameter = getLibraryParameter(reportParameters) || [];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycleWithParameterFilters)
        .then(combineCycleResultsForReport(transformOfferingToSelectedProductsResultRow))
        .then(returnReportResults(columns))
        .catch(stackTraceError);

    function transformOfferingToSelectedProductsResultRow( offering ){
        var row = {
            cycle: offering.cycle.name,
            library: offering.library.name,
            license: licenseName(offering),
            vendor: offering.vendor.name,
            product: offering.product.name,
            selection: offering.selection.users,
            price: offeringRepository.getFullSelectionPrice(offering)
        };
        
        if ( isEnabled('detailCode') ){
            row.detailCode = offering.product.detailCode || '';
        }

        return row;
    }

    function isEnabled(columnName){
        return columns.indexOf(columnName) !== -1;
    }

    function getSelectedProductsForEachCycleWithParameterFilters( listOfCycles ){
        return Q.all( listOfCycles.map(getSelectedProductsForCycle) );

        function getSelectedProductsForCycle( cycle ) {
            return offeringRepository.listOfferingsWithSelectionsUnexpanded(cycle)
                .then(filterVendorsByParameter)
                .then(filterLibrariesByParameter)
                .then(fillInCycle(cycle))
                .then(fillInProducts(cycle))
                .then(filterLicensesByParameter)
                .then(fillInLibraries)
                .then(attachVendorToOfferings);
        }
    }

    function filterVendorsByParameter(offerings) {
        return offerings.filter(filterVendors);

        function filterVendors(offering) {
            return vendorsParameter.indexOf(offering.vendorId) >= 0;
        }
    }


    function filterLibrariesByParameter(offerings) {
        return offerings.filter(filterLibraries);

        function filterLibraries(offering) {
            return librariesParameter.indexOf(offering.library) >= 0;
        }
    }

    function filterLicensesByParameter(offerings) {
        return offerings.filter(filterLicenses);

        function filterLicenses(offering) {
            if (offering.product.hasOwnProperty('license') && offering.product.license)
                return licensesParameter.indexOf(offering.product.license.id) >= 0;
            console.log('no license!');
            return false;
        }
    }
}

function contactsReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['library', 'type', 'name', 'email', 'phoneNumber', 'address', 'city', 'state', 'zip'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));

    return libraryRepository.listAllContacts()
        .then(function(listOfContacts){
            return listOfContacts.map(transformContactToResultRow);
        })
        .then(returnReportResults(columns, ['asc']))
        .catch(stackTraceError);

    function transformContactToResultRow( contact ){
        return {
            library: contact.library || ' ',
            type: contact.contactType || ' ',
            name: contact.firstName + ' ' + contact.lastName || ' ',
            email: contact.email || ' ',
            phoneNumber: contact.phoneNumber || ' ',
            address: (contact.address1 || '') + ' ' + (contact.address2 || ''),
            city: contact.city || ' ',
            state: contact.state || ' ',
            zip: contact.zip || ' '
        };
    }
}

function statisticsReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'vendor', 'product', 'selected'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(combineCycleResultsForReport(transformOfferingToStatisticsReportResultRow))
        .then(groupRowsByVendor)
        .then(returnReportResults(columns))
        .catch(stackTraceError);

    function transformOfferingToStatisticsReportResultRow( offering ){
        return {
            cycle: offering.cycle.name,
            vendor: offering.vendor.name,
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

function selectionsByVendorReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'vendor', 'license', 'product', 'library', 'selection', 'price'];
    var vendorsParameter = getVendorParameter(reportParameters) || [];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(filterVendorsByParameter)
        .then(combineCycleResultsForReport(transformOfferingToSelectionsByVendorResultRow))
        .then(returnReportResults(columns))
        .catch(stackTraceError);

    function transformOfferingToSelectionsByVendorResultRow( offering ){
        var row = {
            cycle: offering.cycle.name,
            license: licenseName(offering),
            vendor: offering.vendor.name,
            product: offering.product.name,
            library: offering.library.name,
            selection: offering.selection.users,
            price: offeringRepository.getFullSelectionPrice(offering)
        };

        if ( isEnabled('detailCode') ){
            row.detailCode = offering.product.detailCode || '';
        }

        return row;
    }

    function isEnabled(columnName){
        return columns.indexOf(columnName) !== -1;
    }

    function filterVendorsByParameter(offeringsByCycle) {
        return offeringsByCycle.map(filterOfferings);

        function filterOfferings(offerings) {
            return offerings.filter(filterVendors);
        }

        function filterVendors(offering) {
            return vendorsParameter.indexOf(offering.vendorId) >= 0;
        }
    }
}

function totalsReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'numberSelected', 'minPrice', 'totalPrice', 'averagePrice'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getSelectedProductsForEachCycle)
        .then(sumOfferingTotals)
        .then(returnReportResults(columns))
        .catch(stackTraceError);

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
                var price = offeringRepository.getFullSelectionPrice(offering);


                result.totalPrice += price;

                if ( price < result.minPrice ){
                    result.minPrice = price;
                }
            }
        }
    }
}

function listProductsForVendorReport( reportParameters, userSelectedColumns ){ /* add optional detailCode */
    var defaultReportColumns = ['cycle', 'license', 'vendor', 'product'];
    var vendorsParameter = getVendorParameter(reportParameters) || [];
    var licensesParameter = getLicenseParameter(reportParameters) || [];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getOfferedProductsForEachCycle)
        .then(filterVendorsByParameter)
        .then(filterLicensesByParameter)
        .then(combineCycleProductsForReport(transformProductToResultRow))
        .then(returnReportResults(columns))
        .catch(stackTraceError);

    function transformProductToResultRow(product){
        var row = {
            cycle: product.cycle.name,
            vendor: product.vendor.name,
            product: product.name,
            license: product.license.name
        };

        if ( isEnabled('detailCode') ){
            row.detailCode = product.detailCode || '';
        }

        return row;
    }

    function isEnabled(columnName){
        return columns.indexOf(columnName) !== -1;
    }

    function filterVendorsByParameter(productsByCycle) {
        return productsByCycle.map(filterProducts);

        function filterProducts(products) {
            return products.filter(filterVendors);
        }

        function filterVendors(product) {
            return vendorsParameter.indexOf(product.vendor.id) >= 0;
        }
    }

    function filterLicensesByParameter(productsByCycle) {
        return productsByCycle.map(filterProducts);

        function filterProducts(products) {
            return products.filter(filterLicenses);
        }

        function filterLicenses(product) {
            if (product.hasOwnProperty('license') && product.license)
                return licensesParameter.indexOf(product.license.id) >= 0;
            return false;
        }
    }
}

function contractsReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'vendor', 'product', 'license'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));
    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getOfferedProductsForEachCycle)
        .then(combineCycleProductsForReport(transformProductToResultRow))
        .then(returnReportResults(columns))
        .catch(stackTraceError);

    function transformProductToResultRow(product){
        return {
            cycle: product.cycle.name,
            vendor: product.vendor.name,
            product: product.name,
            license: product.license ? product.license.name : ''
        };
    }
}

function productNamesReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['cycle', 'product'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));

    var cyclesToQuery = getCycleParameter(reportParameters);

    return cycleRepository.getCyclesById(cyclesToQuery)
        .then(getOfferedProductsForEachCycle)
        .then(combineCycleProductsForReport(transformProductToResultRow))
        .then(returnReportResults(columns))
        .catch(stackTraceError);

    function transformProductToResultRow(product){
        return {
            cycle: product.cycle.name,
            product: product.name
        };
    }
}

function listLibrariesReport( reportParameters, userSelectedColumns ){
    var defaultReportColumns = ['name'];
    var columns = defaultReportColumns.concat(enabledUserColumns(userSelectedColumns));

    return libraryRepository.list()
        .then(function(allLibraries){
            return allLibraries.map(transformLibraryToResultRow)
        })
        .then(returnReportResults(columns, ['asc']))
        .catch(stackTraceError);

    function transformLibraryToResultRow( library ){
        var result = {
            name: library.name
        };

        if ( isEnabled('fte') ){
            result.fte = library.fte;
        }

        if ( isEnabled('institutionType') ){
            result.institutionType = library.institutionType;
        }

        if ( isEnabled('institutionYears') ){
            result.institutionYears = library.institutionYears;
        }

        if ( isEnabled('membershipLevel') ){
            result.membershipLevel = library.membershipLevel;
        }

        if ( isEnabled('isIshareMember') ) {
            if ('isIshareMember' in library) {
                result.isIshareMember = !!library.isIshareMember ? 'yes' : 'no';
            }
            else {
                result.isIshareMember = '';
            }
        }

        if ( isEnabled('isActive') ) {
            if ('isActive' in library) {
                result.isActive = !!library.isActive ? 'yes' : 'no';
            }
            else {
                result.isActive = '';
            }
        }

        return result;
    }

    function isEnabled(columnName){
        return columns.indexOf(columnName) !== -1;
    }
}

function enabledUserColumns(userSelectedColumns){
    var columnDefinitions = JSON.parse(userSelectedColumns);

    var enabledColumns = [];

    Object.keys(columnDefinitions).forEach(function(columnName){
        if ( columnDefinitions[columnName] ){
            enabledColumns.push(columnName);
        }
    });

    return enabledColumns;
}

function getCycleParameter(userSelectedColumnsStr){
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);
    return userSelectedColumns.cycle;
}

function getVendorParameter(userSelectedColumnsStr){
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);
    return userSelectedColumns.vendor;
}

function getProductParameter(userSelectedColumnsStr){
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);
    return userSelectedColumns.product;
}

function getLibraryParameter(userSelectedColumnsStr){
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);
    return userSelectedColumns.library;
}

function getLicenseParameter(userSelectedColumnsStr){
    var userSelectedColumns = JSON.parse(userSelectedColumnsStr);
    return userSelectedColumns.license;
}

function getSelectedProductsForEachCycle( listOfCycles ){
    return Q.all( listOfCycles.map(getSelectedProductsForCycle) );

    function getSelectedProductsForCycle( cycle ){
        return offeringRepository.listOfferingsWithSelectionsUnexpanded(cycle)
            .then(fillInCycle(cycle))
            .then(fillInProducts(cycle))
            .then(fillInLibraries)
            .then(attachVendorToOfferings);
    }
}

function getOfferedProductsForEachCycle( listOfCycles ) {
    return Q.all( listOfCycles.map(getProductsForCycle) );

    function getProductsForCycle(cycle) {
        return productRepository.listActiveProductsUnexpanded(cycle)
                .then(fillInCycle(cycle))
                .then(fillInVendors)
                .then(fillInLicenses);
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
                if ( !offering ){ Logger.log('  * bad offering object: undefined', offering); return; }
                if ( !offering.cycle ){ Logger.log('  ** bad offering cycle', offering.id); return; }
                if ( !offering.library ){ Logger.log('  ** bad offering library from '+offering.cycle.name, offering.id); return; }
                if ( !offering.product ){ Logger.log('  ** bad offering product from '+offering.cycle.name, offering.id); return; }

                results.push(transformFunction(offering));
            }
        }

        return results;
    }
}

function combineCycleProductsForReport( transformFunction ){
    return function( listOfListOfProductsPerCycle ){
        var results = [];

        listOfListOfProductsPerCycle.forEach(addProductsToResults);

        function addProductsToResults(listOfProducts) {
            listOfProducts.forEach(function(product){
                results.push(transformFunction(product));
            });
        }

        return results;
    }
}

function ensureResultListsAreInReverseChronologicalCycleOrder( listOfListsOfOfferings ){
    listOfListsOfOfferings.sort(reverseChronologicalSortListOfOfferings);

    function reverseChronologicalSortListOfOfferings(listA, listB){
        var sampleOfferingA = listA[0] || {};
        var sampleOfferingB = listB[0] || {};

        var cycleA = sampleOfferingA.cycle || {};
        var cycleB = sampleOfferingB.cycle || {};

        var yearA = cycleA.year || Infinity;
        var yearB = cycleB.year || Infinity;

        return yearB - yearA;
    }
}

function fillInCycle(cycle){
    return function(entities) {
        entities.forEach(function(entity) {
            entity.cycle = cycle || {};
        });
        return entities;
    }
}

function fillInLibraries(offerings){
    return initLibraryMap()
        .then(replaceLibraryIdsWithObjects)
        .thenResolve(offerings);

    function replaceLibraryIdsWithObjects(librariesById){
        offerings.forEach(function(offering){
            offering.library = librariesById[offering.library] || {};
        });
    }
}

function fillInProducts(cycle){
    return function(offerings){
        return initProductMap(cycle)
            .then(replaceProductIdsWithProductObjects)
            .thenResolve(offerings);

        function replaceProductIdsWithProductObjects(productsById){
            offerings.forEach(function(offering){
                offering.product = productsById[offering.product] || {};
            });
        }
    }
}

function fillInVendors(products){
    return initVendorMap()
        .then(replaceVendorIdsWithVendorObjects)
        .thenResolve(products);

    function replaceVendorIdsWithVendorObjects(vendorsById){
        products.forEach(function(product){
            product.vendor = vendorsById[product.vendor] || {};
        });
    }
}

function fillInLicenses(products){
    return initLicenseMap()
        .then(replaceLicenseIdsWithLicenseObjects)
        .thenResolve(products);

    function replaceLicenseIdsWithLicenseObjects(licensesById){
        products.forEach(function(product){
            product.license = licensesById[product.license] || {};
        });
    }
}

function attachVendorToOfferings(offerings){
    return initVendorMap()
        .then(attachVendorObjects)
        .thenResolve(offerings);

    function attachVendorObjects(vendorsById){
        offerings.forEach(function(offering){
            offering.vendor = vendorsById[offering.vendorId] ? vendorsById[offering.vendorId] : '';
        });
    }
}

function returnReportResults(resultColumns, columnSortOrderOverride){
    // cycle is first in most reports, which should be descending and the rest default to ascending
    var columnSortOrder =  columnSortOrderOverride || ['desc', 'asc', 'asc'];
    return function( reportResults ){
        return {
            columns: columnNames(resultColumns),
            data: _.orderBy(reportResults, resultColumns, columnSortOrder)
        };
    }
}

function columnNames( columnList ){
    var results = {};

    columnList.forEach(function(columnKey){
        if ( columnName[columnKey] ) {
            results[columnKey] = columnName[columnKey];
        }
        else {
            results[columnKey] = columnKey;
        }
    });

    return results;
}

function initLibraryMap(){
    var libraryMap = {};

    return libraryRepository.list()
        .then(function(libraryList){
            libraryList.forEach(function(library){
                libraryMap[library.id] = library;
            });
            return libraryMap;
        });
}

function initProductMap( cycle ){
    var productMap = {};

    return productRepository.list(cycle)
        .then(function(productList){
            productList.forEach(function(product){
                productMap[product.id] = product;
            });
            return productMap;
        });
}

function initVendorMap(){
    var vendorMap = {};

    return vendorRepository.list()
        .then(function(vendorList){
            vendorList.forEach(function(vendor){
                vendorMap[vendor.id] = vendor;
            });
            return vendorMap;
        });
}

function initLicenseMap(){
    var licenseMap = {};

    return licenseRepository.listLicensesUnexpanded()
        .then(function(licenseList){
            licenseList.forEach(function(license){
                licenseMap[license.id] = license;
            });
            return licenseMap;
        });
}

function licenseName(offering){
    var product = offering.product || {};
    return product.license ? product.license.name : ''
}

function stackTraceError(err){
    Logger.log('ERROR',err.stack);
}

function logData(data){
    console.log('  sending data ~'+(data.length*.00013).toFixed(2)+'mb');
    return data;
}

module.exports = {
    allPricingReport: allPricingReport,
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
