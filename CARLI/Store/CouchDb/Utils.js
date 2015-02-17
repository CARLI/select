var config = require('../../../config');
var middleware = require('../../../config/environmentDependentModules').middleware,
    Q = require('q'),
    request = require('../../../config/environmentDependentModules').request,
    StoreOptions = require( '../../../config').storeOptions,
    queryString = require('query-string')
;

function couchRequest(requestOptions) {
    var deferred = Q.defer();

    request(requestOptions, handleCouchResponse);

    function handleCouchResponse(error, response, body) {
        var data = (typeof body === 'string') ? JSON.parse(body) : body;
        var err = error || data.error;

        if (err) {
            deferred.reject(config.errorMessages.fatal);
        } else {
            deferred.resolve(data);
        }
    }

    return deferred.promise;
}

function getCouchDocuments(dbName, ids) {
    var url = StoreOptions.couchDbUrl + '/' + dbName + '/' + '_all_docs?include_docs=true';

    return couchRequest({
        url: url,
        method: 'post',
        json: { keys: ids }
    }).then(function processResults(results){
        return results.rows.map(function(row){
            return row.doc;
        });
    });
}

function getCouchViewResultObject( dbName, viewName, key, group) {
    var deferred = Q.defer();
    var url = couchViewUrl(dbName, viewName, key, group);

    couchRequest({ url: url })
        .then(resolveWithRowValues)
        .catch(function(error) {
            deferred.reject(error);
        });

    function resolveWithRowValues(data) {
        if (data.rows) {
            var resultObject = {};
            data.rows.forEach(function (row) {
                resultObject[row.key] = row.value;
            });
            deferred.resolve(resultObject);
        } else {
            // "this will never happen"
            deferred.reject('failed to get results for ' + viewName);
        }
    }

    return deferred.promise;
}

function getCouchViewResultValues( dbName, viewName, key, group) {
    var deferred = Q.defer();
    var url = couchViewUrl(dbName, viewName, key, group);

    couchRequest({ url: url })
        .then(resolveWithRowValues)
        .catch(function(error) {
            deferred.reject(error);
        });

    function resolveWithRowValues(data) {
        if (data.rows) {
            var results = data.rows.filter(rowHasValue).map(getRowValue);
            deferred.resolve(results);
        } else {
            // "this will never happen"
            deferred.reject('failed to get results for ' + viewName);
        }
    }
    function rowHasValue(row) {
        return row.value ? true : false;
    }
    function getRowValue(row) {
        return row.value;
    }

    return deferred.promise;
}

function couchViewUrl(dbName, viewName, key, group) {
    var url = StoreOptions.couchDbUrl + '/' + dbName + '/' + '_design/CARLI/_view/' + viewName;

    var queryParams = {};
    if (key) {
        if (typeof key === 'number') {
            queryParams.key = key;
        }
        else {
            queryParams.key = '"' + key + '"';
        }
    }
    if (group) {
        queryParams.group = true;
    }

    var str = queryString.stringify(queryParams);
    if (str) {
        url += '?' + str;
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

    var dbType = (dbName == StoreOptions.couchDbName) ? 'CARLI' : 'Cycle';

    request.put(StoreOptions.couchDbUrl + '/' + dbName,  function(error, response, body) {
        if (error) {
            deferred.reject(error);
        } else if (response.statusCode >= 200 && response.statusCode <= 299) {
            middleware.putDesignDoc(dbName, dbType).then(function () {
                deferred.resolve();
            });
        } else {
            console.log(body);
            deferred.reject("Could not create database " + dbName + " statusCode=" + response.statusCode);
        }
    });
    return deferred.promise;
}

/**
 * Note 1: Only supports the case where target and source are the same couch instance.
 *         (Specifically, the one configured in config.storeOptions)
 * Note 2: Will *not* automatically create the database if it doesn't exist.
 *         Attempting to replicate to a nonexistent database is an error.
 *
 * replicateFrom('some-database').to('another-database');
 */
function replicateFrom(sourceDbName) {
    return { to: replicateTo };

    function replicateTo(targetDbName) {
        var deferred = Q.defer();
        var requestOptions = _couchReplicationOptions(sourceDbName, targetDbName);

        couchRequest(requestOptions)
            .then(function resolveReplication(data) {
                if (data.ok) {
                    // console.log("OK: Replicated " + sourceDbName + " to " + targetDbName);
                    deferred.resolve();
                } else {
                    deferred.reject('replication failed ['+sourceDbName+' -> '+targetDbName+']');
                }
            })
            .catch(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }
}
function _couchReplicationOptions(sourceDbName, targetDbName) {
    return {
        url: StoreOptions.couchDbUrl + '/_replicate',
        method: 'post',
        json: {
            source: sourceDbName,
            target: targetDbName
        }
    };
}

module.exports = {
    couchViewUrl: couchViewUrl,
    createDatabase: createDatabase,
    couchRequest: couchRequest,
    getCouchDocuments: getCouchDocuments,
    getCouchViewResultObject: getCouchViewResultObject,
    getCouchViewResultValues: getCouchViewResultValues,
    makeValidCouchDbName: makeValidCouchDbName,
    replicateFrom: replicateFrom
};
