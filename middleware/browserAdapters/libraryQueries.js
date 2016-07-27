var middlewareRequest = require('./middlewareRequest');

function listSelectionsForLibraryFromCycle( libraryId, cycleId ){
    if (!libraryId) {
        throw new Error('listSelectionsForLibraryFromCycle received invalid libraryId');
    }
    return middlewareRequest({
        path: '/list-selections-for-library/' + libraryId + '/from-cycle/' + cycleId,
        method: 'get',
        json: true
    });
}

function listOfferingsForLibraryWithExpandedProducts( libraryId, cycleId ){
    return middlewareRequest({
        path: '/list-offerings-for-library-with-expanded-products/' + libraryId + '/from-cycle/' + cycleId,
        method: 'get',
        json: true
    });
}

function listNotificationsForLibrary() {
    return middlewareRequest({
        path: '/list-notifications-for-library',
        method: 'get',
        json: true
    });
}

function getHistoricalSelectionDataForLibraryForProduct( libraryId, productId, cycleId ){
    return middlewareRequest({
        path: '/get-historical-selection-data-for-library/' + libraryId + '/for-product/' + productId + '/from-cycle/' + cycleId,
        method: 'get',
        json: true
    });
}

module.exports = {
    listSelectionsForLibraryFromCycle: listSelectionsForLibraryFromCycle,
    listOfferingsForLibraryWithExpandedProducts: listOfferingsForLibraryWithExpandedProducts,
    listNotificationsForLibrary: listNotificationsForLibrary,
    getHistoricalSelectionDataForLibraryForProduct: getHistoricalSelectionDataForLibraryForProduct
};
