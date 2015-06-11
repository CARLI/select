var config = require('../../config');
var request = require('browser-request');
var Q = require('q');

module.exports = function middlewareRequest(requestParams) {
    var deferred = Q.defer();

    requestParams.url = config.getMiddlewareUrl() + requestParams.path;
    delete requestParams.path;

    var token = getAuthToken();
    if (token) {
        if (!requestParams.headers) {
            requestParams.headers = {};
        }
        requestParams.headers['X-AuthToken'] = token;
    }

    request(requestParams, function(error, response, body) {
        if (error) {
            deferred.reject(error);
        } else {
            if ( response.statusCode >= 400 ){
                deferred.reject(body);
            }
            else {
                deferred.resolve(body);
            }
        }
    });
    return deferred.promise;
};

function getAuthToken() {
    return window.sessionStorage.getItem('authToken');
}
