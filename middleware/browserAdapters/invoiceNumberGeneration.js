var middlewareRequest = require('./middlewareRequest');

function generateNextBatchId(){
    return middlewareRequest( {path: '/next-batch-id', method: 'get'} )
        .then(getResultFromJson);
}

function generateNextInvoiceNumber(){
    return middlewareRequest( {path: '/next-invoice-number', method: 'get'} )
        .then(getResultFromJson);
}

function getResultFromJson(jsonResult){
    return jsonResult.result;
}

module.exports = {
    generateNextBatchId: generateNextBatchId,
    generateNextInvoiceNumber: generateNextInvoiceNumber
};