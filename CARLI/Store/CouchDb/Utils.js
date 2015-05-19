var config = require('../../../config');
var couchApp = require('../../../config/environmentDependentModules/couchApp'),
    couchError = require('./Error'),
    Q = require('q'),
    request = require('../../../config/environmentDependentModules/request'),
    StoreOptions = require( '../../../config').storeOptions,
    queryString = require('query-string')
;

function couchRequest(requestOptions) {
    var deferred = Q.defer();

    request(requestOptions, handleCouchResponse);

    function handleCouchResponse(error, response, body) {
        var data = (typeof body === 'string') ? JSON.parse(body) : body;

        if ( error ){
            deferred.reject( couchError(error) );
        }
        else if (data.error) {
            deferred.reject( couchError(data) );
        }
        else {
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

function bulkUpdateDocuments(dbName, documents) {
    var url = StoreOptions.couchDbUrl + '/' + dbName + '/' + '_bulk_docs';

    return couchRequest({
        url: url,
        method: 'post',
        json: { docs: documents }
    }).then(function processResults(results){
        return results;
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
    var url = couchViewUrl(dbName, viewName, key, group);
    return getCouchViewValuesFromUrl(url);
}

function getCouchViewResultValuesWithinRange( dbName, viewName, startKey, endKey ) {
    var url = couchViewUrl(dbName, viewName);
    url += '?startkey="' + startKey + '"&endkey="' + endKey + '"';
    return getCouchViewValuesFromUrl(url);
}

function getCouchViewResultValuesWithLimit( dbName, viewName, key, limit ) {
    var url = couchViewUrl(dbName, viewName, key);
    url += '&limit='+limit;
    return getCouchViewValuesFromUrl(url);
}

function getCouchViewValuesFromUrl( couchUrl ){
    var deferred = Q.defer();

    couchRequest({ url: couchUrl })
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
            couchApp.putDesignDoc(dbName, dbType).then(function () {
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
        var requestOptions = couchReplicationOptions();

        couchRequest(requestOptions)
            .then(function resolveReplication(data) {
                if (data.ok) {
                    console.log("OK: Replicated " + sourceDbName + " to " + targetDbName);
                    deferred.resolve();
                } else {
                    deferred.reject('replication failed ['+sourceDbName+' -> '+targetDbName+']');
                }
            })
            .catch(function(error) {
                deferred.reject(error);
            });

        return deferred.promise;

        function couchReplicationOptions() {
            return {
                url: StoreOptions.couchDbUrl + '/_replicate',
                method: 'post',
                json: {
                    source: sourceDbName,
                    target: targetDbName
                }
            };
        }
    }
}

function replicateForVendor(vendorId) {
    return { from: replicateFrom };

    function replicateFrom(sourceDbName) {
        return { to: replicateTo };

        function replicateTo(targetDbName) {
            var deferred = Q.defer();
            var requestOptions = couchReplicationOptions();

            couchRequest(requestOptions)
                .then(function resolveReplication(data) {
                    if (data.ok) {
                        deferred.resolve();
                    } else {
                        deferred.reject('replication failed [' + sourceDbName + ' -> ' + targetDbName + ']');
                    }
                })
                .catch(function (error) {
                    deferred.reject(error);
                });

            return deferred.promise;

            function couchReplicationOptions() {
                return {
                    url: StoreOptions.couchDbUrl + '/_replicate',
                    method: 'post',
                    json: {
                        source: sourceDbName,
                        target: targetDbName,
                        filter: "CARLI/filterCycleDatabaseForVendor",
                        query_params: {"vendorId": vendorId}
                    }
                };
            }
        }
    }
}

function startVendorDatabaseReplication(sourceCycleDbName, vendorCycleDbName, vendorId) {
    var sourceToVendorOptions = getReplicationRequestOptions(sourceCycleDbName, vendorCycleDbName);
    var vendorToSourceOptions = getReplicationRequestOptions(vendorCycleDbName, sourceCycleDbName);

    return couchRequest(sourceToVendorOptions).then(function() {
        return couchRequest(vendorToSourceOptions)
    });

    function getReplicationRequestOptions(sourceDbName, targetDbName) {
        return {
            url: StoreOptions.couchDbUrl + '/_replicator',
            method: 'post',
            json: {
                source: StoreOptions.couchDbUrl + '/' + sourceDbName,
                target: StoreOptions.couchDbUrl + '/' + targetDbName,
                filter: "CARLI/filterCycleDatabaseForVendor",
                query_params: {"vendorId": vendorId},
                continuous: true
            }
        };
    }
}

function getVendorDatabaseReplicationStatus(databaseName, since, vendorId) {
    var requestOptions = {
        url: StoreOptions.couchDbUrl + '/' + databaseName + '/_changes' +
            '?since=' + since + '&filter=CARLI/filterCycleDatabaseForVendor&vendorId='+vendorId,
        method: 'get'
    };

    return couchRequest(requestOptions);

}

function getRunningCouchJobs(){
    var url = StoreOptions.couchDbUrl + '/_active_tasks/';

    return couchRequest({ url: url });
}

function triggerViewIndexing(databaseName) {
    var url = StoreOptions.couchDbUrl + '/' + databaseName + '/' + '_design/CARLI/_view/docTypes?stale=update_after';

    return couchRequest({url : url});
}

function doesDatabaseExist(databaseName) {
    var url = StoreOptions.couchDbUrl + '/' + databaseName;

    return couchRequest({url : url})
        .then(function() { return true; })
        .catch(function() { return false; });
}

function getDatabaseInfo(databaseName) {
    var url = StoreOptions.couchDbUrl + '/' + databaseName;

    return couchRequest({url : url});
}
function getDatabaseDesignDocInfo(databaseName) {
    var url = StoreOptions.couchDbUrl + '/' + databaseName + '/_design/CARLI/_info';

    return couchRequest({url : url});
}

function getCycleReplicationStatus( cycle ){
    return getRunningCouchJobs().then(filterReplicationJobs).then(filterByTargetCycle).then(resolveToProgress);

    function filterReplicationJobs( jobs ){
        return jobs.filter(function(job){
            return job.type === 'replication';
        });
    }

    function filterByTargetCycle( jobs ){
        return jobs.filter(function(job){
            return job.target === cycle.getDatabaseName();
        });
    }

    function resolveToProgress( jobs ){
        return jobs.length ? jobs[0].progress : 100;
    }
}

function getCycleViewIndexingStatus( cycle ){
    return getRunningCouchJobs().then(filterIndexJobs).then(filterByCycle).then(resolveToProgress);

    function filterIndexJobs( jobs ){
        return jobs.filter(function(job){
            return job.type === 'indexer';
        });
    }

    function filterByCycle( jobs ){
        return jobs.filter(function(job){
            return job.database === cycle.getDatabaseName();
        });
    }

    function resolveToProgress( jobs ){
        return jobs.length ? jobs[0].progress : 100;
    }
}

module.exports = {
    couchViewUrl: couchViewUrl,
    createDatabase: createDatabase,
    couchRequest: couchRequest,
    getCouchDocuments: getCouchDocuments,
    getCouchViewResultObject: getCouchViewResultObject,
    getCouchViewResultValues: getCouchViewResultValues,
    getCouchViewResultValuesWithinRange: getCouchViewResultValuesWithinRange,
    getCouchViewResultValuesWithLimit: getCouchViewResultValuesWithLimit,
    makeValidCouchDbName: makeValidCouchDbName,
    replicateFrom: replicateFrom,
    replicateForVendor: replicateForVendor,
    getRunningCouchJobs: getRunningCouchJobs,
    startVendorDatabaseReplication: startVendorDatabaseReplication,
    getVendorDatabaseReplicationStatus: getVendorDatabaseReplicationStatus,
    triggerViewIndexing: triggerViewIndexing,
    doesDatabaseExist: doesDatabaseExist,
    bulkUpdateDocuments: bulkUpdateDocuments,
    getDatabaseInfo: getDatabaseInfo,
    getDatabaseDesignDocInfo: getDatabaseDesignDocInfo,
    getCycleReplicationStatus: getCycleReplicationStatus,
    getCycleViewIndexingStatus: getCycleViewIndexingStatus
};
