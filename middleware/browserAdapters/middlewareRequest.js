var config = require('../../config');
var carliError = require('../../CARLI/Error');
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
        // TODO remove old fake auth stuff
        requestParams.headers['X-AuthToken'] = token;
    }

    request(requestParams, handleMiddlewareResponse);

    function handleMiddlewareResponse(error, response, body) {
        var data;

        if (error) {
            deferred.reject(carliError(error, response.statusCode));
        }
        else {
            data = (typeof body === 'string') ? JSON.parse(body) : body;
        }

        if (data && data.error) {
            deferred.reject(carliError(data, response.statusCode));
        }
        else {
            deferred.resolve(data);
        }
    }

    return deferred.promise;
};

function getAuthToken() {
    return window.sessionStorage.getItem('authToken');
}
