var middlewareRequest = require('./middlewareRequest');

function listSelectionsForLibraryFromCycle( libraryId, cycleId ){
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

module.exports = {
    listSelectionsForLibraryFromCycle: listSelectionsForLibraryFromCycle,
    listOfferingsForLibraryWithExpandedProducts: listOfferingsForLibraryWithExpandedProducts
};
