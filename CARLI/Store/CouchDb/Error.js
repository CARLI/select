module.exports = function couchError( error, statusCode ){
    var message = '';

    if ( typeof error === 'string' ){
        message = error;
    }
    else {
        if ( error.reason ){
            message = error.reason;
        }
        else if ( error.message ){
            message = error.message;
        }
        else {
            message = null
        }
    }

    return {
        error: error.error,
        message: message,
        originalError: error,
        statusCode: statusCode
    };
};
