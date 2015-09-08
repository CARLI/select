var middlewareRequest = require('./middlewareRequest');

function listProductsWithTermsForPublicWebsite() {
    return middlewareRequest({
        path: 'list-all-products',
        method: 'get'
    });
}

function listSubscriptionsForLibrary(libraryId) {
    return middlewareRequest({
        path: 'list-subscriptions-for-library/' + libraryId,
        method: 'get'
    });
}

module.exports = {
    listProductsWithTermsForPublicWebsite: listProductsWithTermsForPublicWebsite,
    listSubscriptionsForLibrary: listSubscriptionsForLibrary
};
