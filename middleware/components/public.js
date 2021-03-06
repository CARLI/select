
var _ = require('lodash');

var auth = require('../../CARLI/Auth');
var config = require( '../../config' );
var CycleRepository = require('../../CARLI/Entity/CycleRepository');
var LibraryRepository = require('../../CARLI/Entity/LibraryRepository');
var ProductRepository = require('../../CARLI/Entity/ProductRepository');
var OfferingRepository = require('../../CARLI/Entity/OfferingRepository');
var VendorRepository = require('../../CARLI/Entity/VendorRepository');
var moment = require('moment');

function loginToCouch() {
    return auth.createSession({
        email: config.storeOptions.privilegedCouchUsername,
        password: config.storeOptions.privilegedCouchPassword
    });
}

function logoutOfCouch(response) {
    return auth.deleteSession().then(function() {
        return response;
    });
}

function listProductsWithTermsForPublicWebsite() {
    return loginToCouch()
        .then(ProductRepository.listActiveProductsFromActiveCycles)
        .then(restrictToDataForPublicWebsite)
        .then(logoutOfCouch);

    function restrictToDataForPublicWebsite(products) {
        return products.map(restrictProductToPublicData);

        function restrictProductToPublicData(product) {
            var license = product.license;
            if (!license) {
                license = {};
            }
            return {
                productName: product.name,
                vendorName: product.vendor.name,
                currentTermStartDate: formatDate(license.currentTermStartDate),
                currentTermEndDate: formatDate(license.currentTermEndDate),
                totalTermEndDate: formatDate(license.totalTermEndDate),
                terms: license.terms
            }
        }
    }
}

/** Ed from CARLI specifically requested this format */
function formatDate(s) {
    var d = (typeof s) == 'string' ? new Date(s) : s;
    return moment(d).format('MM/DD/YYYY');
}

function listSubscriptionsForLibrary(libraryId) {
    return loginToCouch()
        .then(loadLibrary)
        .then(listSelectedProductsFromActiveCyclesForLibrary)
        .then(restrictToDataForPublicWebsite)
        .then(logoutOfCouch);

    function loadLibrary() {
        return LibraryRepository.load(libraryId);
    }

    function listSelectedProductsFromActiveCyclesForLibrary(library) {
        return OfferingRepository.listSelectedProductsFromActiveCyclesForLibrary(library);
    }
}

function listSubscriptionsForLibraryForCycleName(libraryId, cycleName) {
    return loginToCouch()
        .then(CycleRepository.list)
        .then(function(cycles) {
            return cycles.filter(function(cycle) {
                return cycle.name === cycleName;
            });
        })
        .then(function(matchingCycles) {
            if ( matchingCycles.length)
                return matchingCycles[0];
            else
                throw new Error('Cycle ' + cycleName + ' not found');
        })
        .then(function(cycle) {
            return OfferingRepository.listOfferingsWithSelectionsForLibrary(libraryId, cycle);
        })
        .then(restrictToDataForPublicWebsite)
        .then(logoutOfCouch);
}

function restrictToDataForPublicWebsite(offerings) {
    return loadVendorHash()
        .then(function(vendorsById) {
            return offerings.map(restrictOfferingToPublicData);

            function restrictOfferingToPublicData(offering) {
                return {
                    productName: offering.product.name,
                    vendorName: vendorsById[offering.vendorId].name,
                    funding: offering.funding,
                    cycleName: offering.cycle.name,
                    cycleYear: offering.cycle.year
                }
            }
        });

    function loadVendorHash() {
        var vendorsById = {};

        return VendorRepository.list()
            .then(function (vendors) {
                return vendors.map(function (v) {
                    vendorsById[v.id] = v;
                    return v;
                })
            })
            .thenResolve(vendorsById);
    }
}

module.exports = {
    listProductsWithTermsForPublicWebsite: listProductsWithTermsForPublicWebsite,
    listSubscriptionsForLibrary: listSubscriptionsForLibrary,
    listSubscriptionsForLibraryForCycleName: listSubscriptionsForLibraryForCycleName
};
