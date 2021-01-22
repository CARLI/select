var request = require('request');
var Q = require('q');

var config = require("../../config");

var crmApiUrl = config.crmApi.url;

function listLibraries() {
    var deferred = Q.defer();

    request(crmApiUrl + '/library', function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function loadLibrary(id) {
    var deferred = Q.defer();

    request(crmApiUrl + '/library/' + id, function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function listCrmContactsForLibrary( libraryCrmId ){
    var deferred = Q.defer();

    request(crmApiUrl + '/library/contacts/' + libraryCrmId, function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function listCrmContactsForLibraryIds( libraryCrmsIds ){
    var queryString = libraryCrmsIds.map(function (id) {
        return 'id[]=' + id;
    }).join('&');
    var deferred = Q.defer();

    request(crmApiUrl + '/library/contacts/?' + queryString, function(error, response, body) {
        if (!!error)
            deferred.reject(error);
        else
            deferred.resolve(JSON.parse(body));
    });

    return deferred.promise;
}

function handleError( promise, message, error ){
    var errorObject = {
        message: message,
        error: error
    };
    promise.reject(errorObject);
    return errorObject;
}

module.exports = {
    listLibraries: listLibraries,
    loadLibrary: loadLibrary,
    listCrmContactsForLibrary: listCrmContactsForLibrary,
    listCrmContactsForLibraryIds: listCrmContactsForLibraryIds,
    crmApiUrl: crmApiUrl
};
