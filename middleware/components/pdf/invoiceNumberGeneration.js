var config = require('../../../config');
var fs = require('fs');
var Q = require('q');

var batchIdFileName = config.invoiceDataDir + '/batchId';
var batchIdPrefix = 'USI';
var fallbackBatchId = 0;

var invoiceNumberFileName = config.invoiceDataDir + '/invoiceNumber';
var invoiceNumberPrefix = 'USIN';
var fallBackInvoiceNumber = '00AA';

var readFileOptions = {
    encoding: 'utf8'
};

function generateNextBatchId(){
    var lastBatchId = getLastBatchId();
    var nextBatchId = incrementBatchId(lastBatchId);
    saveBatchId(nextBatchId);

    var result = Q( batchIdPrefix + padWithZeroes(nextBatchId) );

    return result;

    function getLastBatchId() {
        try {
            return fs.readFileSync(batchIdFileName, readFileOptions);
        }
        catch(err){
            Logger.log('  error reading batchId file, using fallback '+fallbackBatchId);
            var fallbackResult = fallbackBatchId;
            return fallbackResult;
        }
    }

    function incrementBatchId( lastValue ){
        return (1 * lastValue) + 1;
    }

    function saveBatchId( valueToSave ) {
        // make sure we're saving a string. In older node versions, fs.writeFileSync accepted number values for the
        // data argument, but we have since upgraded to a version where it does not
        var stringValueToSave = '' + valueToSave;

        fallbackBatchId = valueToSave;
        try {
            fs.writeFileSync(batchIdFileName, stringValueToSave);
        }
        catch (err) {
            Logger.log('  error saving batchId file '+err);
        }
    }

    function padWithZeroes( integerValue ){
        var padLength = 5;
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
    var lastInvoiceNumber = getLastInvoiceNumber();
    var nextInvoiceNumber = incrementInvoiceNumber(lastInvoiceNumber);
    saveInvoiceNumber(nextInvoiceNumber);

    var result = Q( invoiceNumberPrefix + nextInvoiceNumber );

    return result;

    function getLastInvoiceNumber(){
        try {
            return fs.readFileSync(invoiceNumberFileName, readFileOptions);
        }
        catch(err){
            Logger.log('  error reading invoiceNumber file, using fallback '+fallBackInvoiceNumber);
            var fallbackResult = fallBackInvoiceNumber;
            fallBackInvoiceNumber = incrementInvoiceNumber(fallBackInvoiceNumber);
            return fallbackResult;
        }
    }

    function saveInvoiceNumber( valueToSave ) {
        fallBackInvoiceNumber = valueToSave;
        try {
            fs.writeFileSync(invoiceNumberFileName, valueToSave);
        }
        catch (err) {
            Logger.log('  error saving InvoiceNumber file '+err);
        }
    }
}

function incrementInvoiceNumber( lastValue ){
    var incrementThirdCharacter = false;
    var incrementFourthCharacter = false;

    var firstTwoCharacters = lastValue.substr(0,2);
    var thirdCharacter = lastValue.substr(2,1);
    var fourthCharacter = lastValue.substr(3,1);

    var nextNumberForFirstTwoDigits = (1 * firstTwoCharacters) + 1;

    var nextFirstTwoDigits = '' + nextNumberForFirstTwoDigits;
    if ( nextNumberForFirstTwoDigits < 10 ){
        nextFirstTwoDigits = '0' + nextFirstTwoDigits;
    }
    if ( nextNumberForFirstTwoDigits > 99 ){
        nextFirstTwoDigits = '00';
        incrementThirdCharacter = true;
    }

    var nextThirdDigit = thirdCharacter;
    if ( incrementThirdCharacter ){
        nextThirdDigit = incrementLetter(thirdCharacter);
        if ( isPastZ(nextThirdDigit) ){
            incrementFourthCharacter = true;
            nextThirdDigit = 'A';
        }
    }

    var nextFourthDigit = fourthCharacter;
    if ( incrementFourthCharacter ) {
        nextFourthDigit = incrementLetter(fourthCharacter);

        if ( isPastZ(nextFourthDigit) ){
            nextFourthDigit = 'A';
        }
    }

    return '' + nextFirstTwoDigits + nextThirdDigit + nextFourthDigit;

    function incrementLetter(letter){
        var nextValue = letter.charCodeAt(0) + 1;
        return String.fromCharCode(nextValue);
    }

    function isPastZ(character){
        return character.charCodeAt(0) > 90;
    }
}

module.exports = {
    generateNextBatchId: generateNextBatchId,
    generateNextInvoiceNumber: generateNextInvoiceNumber,
    incrementInvoiceNumber: incrementInvoiceNumber //exposed for unit testing
};
