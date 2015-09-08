
var _ = require('lodash');

var auth = require('../../CARLI/Auth');
var config = require( '../../config' );
var LibraryRepository = require('../../CARLI/Entity/LibraryRepository');
var ProductRepository = require('../../CARLI/Entity/ProductRepository');
var OfferingRepository = require('../../CARLI/Entity/OfferingRepository');

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
                currentTermStartDate: license.currentTermStartDate,
                currentTermEndDate: license.currentTermEndDate,
                totalTermEndDate: license.totalTermEndDate,
                terms: license.terms
            }
        }
    }
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
    function restrictToDataForPublicWebsite(offerings) {
        return offerings.map(restrictOfferingToPublicData);

        function restrictOfferingToPublicData(offering) {
            return {
                productName: offering.product.name,
                vendorName: offering.vendor,
                funding: {},
                cycleName: offering.cycle.name,
                cycleYear: offering.cycle.year
            }
        }
    }
}

module.exports = {
    listProductsWithTermsForPublicWebsite: listProductsWithTermsForPublicWebsite,
    listSubscriptionsForLibrary: listSubscriptionsForLibrary
};
