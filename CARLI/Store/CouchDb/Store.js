var config = require('../../../config');
var carliError = require('../../Error');
var Q = require('q');
var request = require('../../../config/environmentDependentModules/request');
var CouchUtils = require('./Utils');

function _cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}


module.exports = function (inputOptions) {

    var options = _cloneData(inputOptions);
    var db_host = options.couchDbUrl + '/' + options.couchDbName;
    var defaultCollection = options.couchDbName;
    var couchUtils = CouchUtils(options);

    return {
        getOptions: getOptions,
        getDataFor: getDataFor,
        storeData: storeData,
        listDataFor: listDataFor,
        deleteDataFor: deleteDataFor
    };

    function getOptions() {
        return options;
    }

    function getDataFor(id) {
        var deferred = Q.defer();

        request({ url: db_host + '/' + id },
            function (requestError, response, body) {
                if (!body) {
                    console.log("Got empty body for " + db_host + '/' + id);
                    console.log(requestError);
                }
                var data = JSON.parse(body);

                if (requestError) {
                    deferred.reject(carliError(requestError, response.statusCode));
                }
                else if (data.error){
                    deferred.reject(carliError(data, response.statusCode));
                }
                else {
                    deferred.resolve(data);
                }
            }
        );
        return deferred.promise;
    }

    function storeData(data) {
        var deferred = Q.defer();

        request({
            uri: db_host + '/' + data.id,
            json: data,
            method: "PUT"
        }, function (err, response, body) {
            var error = err || body.error;
            if (error) {
                deferred.reject(carliError(error, response.statusCode));
            }
            else {
                data._id = body.id;
                data._rev = body.rev;
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    }

    function listDataFor(type, collection) {
        if (collection === undefined) {
            collection = defaultCollection;
        }
        return couchUtils.getCouchViewResultValues(collection, 'listByType', type);
    }

    function deleteDataFor(id) {
        var deferred = Q.defer();

        request({ uri: db_host + '/' + id },
            function (err, response, body) {
                var data = JSON.parse(body);
                var error = err || data.error;
                if (error) {
                    deferred.reject(carliError(error, response.statusCode));
                }
                else {
                    request({uri: db_host + '/' + id + '?rev=' + data._rev, method: 'DELETE' },
                        function (err, response, body) {
                            var error = err || data.error;
                            if (error) {
                                deferred.reject(carliError(error, response.statusCode));
                            }
                            else {
                                deferred.resolve();
                            }
                        }
                    );
                }
            });
        return deferred.promise;
    }
};
