var fs = require('fs');
var Q = require('q');

var batchIdFileName = '/data/invoiceNumber';
var invocieNumberFileName = '/data/invoiceNumber';

var fallbackBatchId = 0;

var readFileOptions = {
    encoding: 'utf8'
};

function generateNextBatchId(){
    var lastBatchId = getLastBatchId();
    var nextBatchId = incrementBatchId(lastBatchId);

    if ( isNaN(nextBatchId) ){
        return Q.reject('  error getting next batch id: could not increment '+lastBatchId);
    }

    saveBatchId(nextBatchId);

    var result = Q( padWithZeroes(nextBatchId) );

    return result;

    function getLastBatchId() {
        try {
            return fs.readFileSync(batchIdFileName, readFileOptions);
        }
        catch(err){
            console.log('  error reading batchId file, using fallback '+fallbackBatchId);
            var fallbackResult = fallbackBatchId;
            fallbackBatchId = incrementBatchId(fallbackBatchId);
            return fallbackResult;
        }
    }

    function saveBatchId( valueToSave ) {
        fallbackBatchId = valueToSave;
        try {
            fs.writeFileSync(batchIdFileName, nextBatchId);
        }
        catch (err) {
            console.log('  error saving batchId file');
        }
    }

    function incrementBatchId( lastValue ){
        return (1 * lastValue) + 1;
    }

    function padWithZeroes( integerValue ){
        var padLength = 4;
        var stringValue = '' + integerValue;
        if ( stringValue.length > padLength ){
            return stringValue;
        }
        else {
            var arraySize = padLength - stringValue.length + 1;
            return new Array(arraySize).join('0') + stringValue;
        }
    }
}


function generateNextInvoiceNumber(){
    var start = new Date();
    console.log('>>> Begin generateNextInvoiceNumber');

    var result = Q('INVOICE NUMBER');

    var end = new Date();
    var timing = (end-start);
    console.log('<<< generateNextInvoiceNumber took '+timing+'ms');
    return result;
}

module.exports = {
    generateNextBatchId: generateNextBatchId,
    generateNextInvoiceNumber: generateNextInvoiceNumber
};