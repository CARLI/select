module.exports = carliError;

function carliError( error, statusCode ){
    var message = '';
    var errorIndicator = '';

    if ( typeof error === 'string' ){
        return errorFromString(error, statusCode);
    } else if (typeof error.error === 'string') {
        return errorFromResponseData(error, statusCode);
    } else  if (typeof error.error === 'object' ) {
        return errorFromExistingError(error, statusCode);
    }

    return {
        error: 'error',
        message: 'unknown error',
        originalError: error,
        statusCode: statusCode
    };
};

function errorFromString(errorString, statusCode) {
    return {
        error: 'error',
        message: errorString,
        originalError: errorString,
        statusCode: statusCode
    }
}

function errorFromResponseData(error, statusCode) {
    return {
        error: error.error,
        message: findErrorMessage(error),
        originalError: error,
        statusCode: statusCode
    }
}

function errorFromExistingError(error, statusCode) {
    return carliError(error.error, statusCode);
}

function findErrorMessage(error) {
    var message;

    if ( error.reason ){
        message = error.reason;
    }
    else if ( error.message ){
        message = error.message;
    }
    else {
        message = null
    }

    return message;
}
