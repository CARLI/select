var config = require('../../config');
var request = require('browser-request');
var Q = require('q');

module.exports = function middlewareRequest(requestParams) {
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
};
