
var _ = require('lodash');

var auth = require('../../CARLI/Auth');
var config = require( '../../config' );
var ProductRepository = require('../../CARLI/Entity/ProductRepository');

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
    console.log('Listing subscriptions for library', libraryId);
    return loginToCouch()
        .then(returnAnEmptyArray)
        .then(logoutOfCouch);

    /*
     productName,
     vendorName,
     funding,
     cycleName,
     cycleYear
     */
    function returnAnEmptyArray() {
        return [

        ];
    }
}

module.exports = {
    listProductsWithTermsForPublicWebsite: listProductsWithTermsForPublicWebsite,
    listSubscriptionsForLibrary: listSubscriptionsForLibrary
};
