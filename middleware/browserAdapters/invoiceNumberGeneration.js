var middlewareRequest = require('./middlewareRequest');

function generateNextBatchId(){
    return middlewareRequest({
        path: '/next-batch-id',
        method: 'get'
    });
}

function generateNextInvoiceNumber(){
    return middlewareRequest({
        path: '/next-invoice-number',
        method: 'get'
    });
}

module.exports = {
    generateNextBatchId: generateNextBatchId,
    generateNextInvoiceNumber: generateNextInvoiceNumber
};