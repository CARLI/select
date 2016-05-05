var middlewareRequest = require('../middlewareRequest');

function uploadSitePricing(fileContents) {
    return middlewareRequest({
        path: '/csv/import/pricing',
        method: 'post',
        headers: {
            'Content-Type': 'text/csv'
        },
        body: fileContents
    });
}

module.exports = {
    uploadSitePricing: uploadSitePricing
};
