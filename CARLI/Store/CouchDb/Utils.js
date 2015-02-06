var middleware = require('../../../config/environmentDependentModules').middleware,
    Q = require('q'),
    request = require('../../../config/environmentDependentModules').request,
    StoreOptions = require( '../../../config').storeOptions
;

function couchRequest(requestOptions) {
    var deferred = Q.defer();

    request(requestOptions, handleCouchResponse);

    function handleCouchResponse(error, response, body) {
        var data = (typeof body === 'string') ? JSON.parse(body) : body;
        var err = error || data.error;

        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(data);
        }
    }

    return deferred.promise;
}

function getCouchViewResults( dbName, viewName, key) {
    var deferred = Q.defer();
    var url = _assembleCouchViewUrl(dbName, viewName, key);

    function rowHasValue(row) {
        return row.value ? true : false;
    }
    function getRowValue(row) {
        return row.value;
    }

    couchRequest({ url: url }).then(function (data) {
        if (data.rows) {
            var results = data.rows.filter(rowHasValue).map(getRowValue);
            deferred.resolve(results);
        } else {
            // "this will never happen"
            deferred.reject('failed to get results for ' + viewName);
        }
    }).catch(function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}
function _assembleCouchViewUrl(dbName, viewName, key) {
    var url = StoreOptions.couchDbUrl + '/' + dbName + '/' + '_design/CARLI/_view/' + viewName;
    if (key) {
        url += '?key="' + key + '"';
    }
    return url;
}

function makeValidCouchDbName(name) {
    name = name.toLowerCase();
    name = name.replace(/[ /]/g, '-');
    name = name.replace(/[^a-z0-9_$()+-]/g, '');
    return name;
}

function createDatabase(dbName) {
    var deferred = Q.defer();

    request.put(StoreOptions.couchDbUrl + '/' + dbName,  function(error, response, body) {
        if (error) {
            deferred.reject(error);
        } else if (response.statusCode >= 200 && response.statusCode <= 299) {
            middleware.putDesignDoc(dbName).then(function () {
                deferred.resolve();
            });
        } else {
            console.log(body);
            deferred.reject("Could not create database " + dbName + " statusCode=" + response.statusCode);
        }
    });
    return deferred.promise;
}



module.exports = {
    createDatabase: createDatabase,
    couchRequest: couchRequest,
    getCouchViewResults: getCouchViewResults,
    makeValidCouchDbName: makeValidCouchDbName
};
