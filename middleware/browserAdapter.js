var config = require('../config');
var request = require('browser-request');
var Q = require('q');

function putDesignDoc(dbName) {
    var deferred = Q.defer();
    request.put(config.getMiddlewareUrl() + '/design-doc/' + dbName, function(error, response, body) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}

module.exports = {
    putDesignDoc: putDesignDoc
};