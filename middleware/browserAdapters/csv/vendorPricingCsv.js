var middlewareRequest = require('../middlewareRequest');

function uploadSitePricing(fileContents) {
    return middlewareRequest({
        path: '/csv/import/pricing',
        method: 'post',
        body: fileContents
    });
}

module.exports = {
    uploadSitePricing: uploadSitePricing
};
