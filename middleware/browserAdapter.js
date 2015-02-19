var config = require('../config');
var request = require('browser-request');
var Q = require('q');

function middlewareRequest(requestParams) {
    var deferred = Q.defer();

    requestParams.url = config.getMiddlewareUrl() + requestParams.path;
    delete requestParams.path;

    request(requestParams, function(error, response, body) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(body);
        }
    });
    return deferred.promise;
}

function putDesignDoc(dbName) {
    return middlewareRequest({
        path: '/design-doc/' + dbName,
        method: 'put'
    });
}
function listLibraries() {
    return middlewareRequest({
        path: '/library/',
        method: 'get',
        json: true
    });
}
function loadLibrary(id) {
    return middlewareRequest({
        path: '/library/' + id,
        method: 'get',
        json: true
    });
}

module.exports = {
    putDesignDoc: putDesignDoc,
    tellPixobot: function() {},
    listLibraries: listLibraries,
    loadLibrary: loadLibrary
};
