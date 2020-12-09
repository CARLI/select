var config = require('../../../config');
var couchApp = require('../../../config/environmentDependentModules/couchApp');
var carliError = require('../../Error');
var Q = require('q');
var request = require('../../../config/environmentDependentModules/request');
var queryString = require('query-string');
var _ = require('lodash');

module.exports = function (storeOptions) {

    if (!storeOptions) {
        storeOptions = config.storeOptions;
    }

    function couchRequest(requestOptions) {
        var deferred = Q.defer();

        request(requestOptions, handleCouchResponse);

        function handleCouchResponse(error, response, body) {
            var data;
            var statusCode = 500;
            if (response) {
                statusCode = response.statusCode;
            }

            if (error) {
                deferred.reject(carliError(error, statusCode));
            }
            else {
                if ( typeof body === 'string' ){
                    try {
                        data = JSON.parse(body);
                    }
                    catch ( parseError ){
                        Logger.log('Error parsing response from '+requestOptions.url);
                        data = { error: 'error parsing '+body };
                    }
                }
                else {
                    data = body;
                }

                if (data && data.error) {
                    Logger.log("CouchRequest Error in Response from " + requestOptions.url, data);
                    deferred.reject(carliError(data, statusCode));
                }
                else {
                    deferred.resolve(data);
                }
            }
        }

        function isJsonString(text) {
            if (typeof text !== 'string') {
                return false;
            }
            try {
                JSON.parse(text);
            } catch (e) {
                Logger.log('error!', e);
                return false;
            }
            return true;
        }
        return deferred.promise;
    }

    function couchRequestSession(userLogin) {
        var deferred = Q.defer();

        var requestOptions = {
            url: storeOptions.couchDbUrl + '/_session',
            method: 'post',
            json: {
                name: userLogin.email,
                password: userLogin.password
            }
        };

        request(requestOptions, handleCouchResponse);

        function handleCouchResponse(error, response, body) {
            var data;
            var statusCode = 500;
            if (response) {
                statusCode = response.statusCode;
            }

            if (error) {
                deferred.reject(carliError(error, statusCode));
            }
            else {
                if (typeof body !== 'object') {
                    if (isJsonString(body)) {
                        data = JSON.parse(body);
                    } else {
                        deferred.reject(carliError(body, statusCode));
                    }
                }
                data = (typeof body === 'string') ? JSON.parse(body) : body;

                if (data && data.error) {
                    deferred.reject(carliError(data, statusCode));
                }
                else {
                    data.authCookie = getAuthCookie(response);
                    deferred.resolve(data);
                }
            }
        }

        function getAuthCookie(response) {
            return response.headers[ 'set-cookie' ];
        }

        return deferred.promise;
    }

    function listDatabases() {
        var url = storeOptions.couchDbUrl + '/_all_dbs';

        return couchRequest({
            url: url,
            method: 'get'
        }).catch(function(err){
            Logger.log('listDatabases failed. Requested ' + url);
            Logger.log(' error:', err);
            throw err;
        });
    }

    function getCouchDocuments(dbName, ids) {
        var url = storeOptions.couchDbUrl + '/' + dbName + '/' + '_all_docs?include_docs=true';

        return couchRequest({
            url: url,
            method: 'post',
            json: { keys: ids }
        }).then(function processResults(results){
            return results.rows.map(function(row){
                return row.doc;
            });
        }).catch(function(err){
            Logger.log('getCouchDocuments failed. Requested ' + url);
            Logger.log(' with IDs ', ids);
            Logger.log(' error:', err);
            throw err;
        });
    }

    function bulkUpdateDocuments(dbName, documents) {
        var url = storeOptions.couchDbUrl + '/' + dbName + '/' + '_bulk_docs';

        Logger.log(`Documents length as array: ${documents.length} as Object: ${Object.keys(documents).length}`);
        Logger.log(`Approximate size of documents ${JSON.stringify(documents).length} ~bytes`);
        Logger.log(`Approximate size of documents ${JSON.stringify(documents).length / 1000} ~kbytes`);
        Logger.log(`Approximate size of documents ${JSON.stringify(documents).length / 1000000} ~mbytes`);

        return couchRequest({
            url: url,
            method: 'post',
            json: { docs: documents }

        }).then(function processResults(results){
            return results;
        }).catch(function catchError(e){
            Logger.log("INNER_OFFERINGS_ERROR] : ", e);
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

    function getCouchViewResultValuesWithNamedDesignDoc( dbName, designDocName, viewName, key, group) {
        var url = couchViewUrlFromDesignDoc(dbName, designDocName, viewName, key, group);
        return getCouchViewValuesFromUrl(url);
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

    function couchViewUrlFromDesignDoc(dbName, designDocName, viewName, key, group) {

        var url = storeOptions.couchDbUrl + '/' + dbName + '/' + '_design/' + designDocName + '/_view/' + viewName;

        var queryParams = {};

        if (key != null && typeof key !== 'undefined') {
            if (_.isArray(key)){
                queryParams.keys = makeArrayOfKeys(key);
            }
            else {
                queryParams.key = quoteKey(key);
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

        function quoteKey(key) {
            if (typeof key === 'number') {
                return key;
            }
            else {
                return '"' + key + '"';
            }
        }

        function makeArrayOfKeys(keys) {
            var quotedKeys = keys.map(quoteKey);
            return '[' + quotedKeys.join(',') + ']';
        }
    }

    function couchViewUrl(dbName, viewName, key, group) {
        return couchViewUrlFromDesignDoc(dbName, 'CARLI', viewName, key, group);
    }

    function makeValidCouchDbName(name) {
        name = name.toLowerCase();
        name = name.replace(/[ /]/g, '-');
        name = name.replace(/[^a-z0-9_$()+-]/g, '');
        return name;
    }

    function createDatabase(dbName, databaseType, associatedEntity) {
        var deferred = Q.defer();

        var dbType = (dbName == storeOptions.couchDbName) ? 'CARLI' : 'Cycle';

        request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

        request.put(storeOptions.privilegedCouchDbUrl + '/' + dbName,  function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                createSecurityDocumentForType(dbName, databaseType, associatedEntity).then(function() {
                    couchApp.putDesignDoc(dbName, dbType).then(function () {
                        deferred.resolve();
                    });
                });
            } else {
                Logger.log("Could not create database " + dbName + " statusCode=" + response.statusCode, body);
                deferred.reject("Could not create database " + dbName + " statusCode=" + response.statusCode);
            }
        });
        return deferred.promise;
    }

    function deleteDatabase(dbName) {
        var deferred = Q.defer();

        request.delete(storeOptions.privilegedCouchDbUrl + '/' + dbName, function(error, response, body) {
            if (error) {
                deferred.reject(error);
            } else if (response.statusCode >= 200 && response.statusCode <= 299) {
                deferred.resolve(dbName + ' deleted');
            } else {
                Logger.log('failed to delete database', body);
                deferred.reject("Could not delete database " + dbName + " statusCode=" + response.statusCode);
            }
        });

        return deferred.promise;
    }

    function createSecurityDocumentForType(dbName, databaseType, entity) {
        var roles = [ '_admin', 'staff' ];

        if (databaseType & couchUtils.DB_TYPE_VENDOR) {
            roles.push('vendor-' + entity.id);
        } else if (databaseType & couchUtils.DB_TYPE_LIBRARY) {
            roles.push('library');
        }

        return couchRequest({
            url: storeOptions.privilegedCouchDbUrl + '/' + dbName + '/_security',
            method: 'put',
            json: {
                admins: {
                    names: [],
                    roles:[]
                },
                members: {
                    names: [],
                    roles: roles
                }
            }
        });
    }

    /**
     * Note 1: Only supports the case where target and source are the same couch instance.
     *         (Specifically, the one configured in storeOptions)
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

            Logger.log('[INNER] Replicating from ' + sourceDbName + ' to ' + targetDbName);

            couchRequest(requestOptions)
                .then(function resolveReplication(data) {
                    if (data.ok) {
                        Logger.log("OK: Replicated " + sourceDbName + " to " + targetDbName);
                        deferred.resolve();
                    } else {
                        Logger.log("ERROR: Replicated " + sourceDbName + " to " + targetDbName);
                        deferred.reject('replication failed ['+sourceDbName+' -> '+targetDbName+']');
                    }
                })
                .catch(function(error) {
                    deferred.reject(error);
                });

            return deferred.promise;

            function couchReplicationOptions() {
                return {
                    url: storeOptions.privilegedCouchDbUrl + '/_replicate',
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
                request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

                var deferred = Q.defer();
                var requestOptions = couchReplicationOptions();

                Logger.log('Replicating from ' + sourceDbName + ' to ' + targetDbName);

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
                        url: storeOptions.privilegedCouchDbUrl + '/_replicate',
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

        request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

        return couchRequest(sourceToVendorOptions).then(function() {
            return couchRequest(vendorToSourceOptions)
        });

        function getReplicationRequestOptions(sourceDbName, targetDbName) {
            return {
                url: storeOptions.privilegedCouchDbUrl + '/_replicator',
                method: 'post',
                json: {
                    source: storeOptions.privilegedCouchDbUrl + '/' + sourceDbName,
                    target: storeOptions.privilegedCouchDbUrl + '/' + targetDbName,
                    filter: "CARLI/filterCycleDatabaseForVendor",
                    query_params: {"vendorId": vendorId},
                    continuous: true
                }
            };
        }
    }

    //potential admin failure to test - db replication status
    function getVendorDatabaseReplicationStatus(databaseName, since, vendorId) {
        var requestOptions = {
            url: storeOptions.privilegedCouchDbUrl + '/' + databaseName + '/_changes' +
                '?since=' + since + '&filter=CARLI/filterCycleDatabaseForVendor&vendorId='+vendorId,
            method: 'get'
        };

        return couchRequest(requestOptions);

    }

    function getRunningCouchJobs(){
        var url = storeOptions.couchDbUrl + '/_active_tasks/';

        request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();

        return couchRequest({ url: url });
    }

    function triggerViewIndexing(databaseName) {
        var url = storeOptions.privilegedCouchDbUrl + '/' + databaseName + '/' + '_design/CARLI/_view/docTypes?stale=update_after';

        return couchRequest({url : url});
    }

    function doesDatabaseExist(databaseName) {
        var url = storeOptions.couchDbUrl + '/' + databaseName;

        return couchRequest({url : url})
            .then(function() { return true; })
            .catch(function() { return false; });
    }

    function getDatabaseInfo(databaseName) {
        var url = storeOptions.couchDbUrl + '/' + databaseName;

        return couchRequest({url : url});
    }
    function getDatabaseDesignDocInfo(databaseName) {
        var url = storeOptions.couchDbUrl + '/' + databaseName + '/_design/CARLI/_info';

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

    var couchUtils = {
        DB_TYPE_TEST: 1,
        DB_TYPE_STAFF: 2,
        DB_TYPE_LIBRARY: 4,
        DB_TYPE_VENDOR: 8,

        couchViewUrl: couchViewUrl,
        createDatabase: createDatabase,
        deleteDatabase: deleteDatabase,
        couchRequest: couchRequest,
        couchRequestSession: couchRequestSession,
        getCouchDocuments: getCouchDocuments,
        listDatabases: listDatabases,
        getCouchViewResultObject: getCouchViewResultObject,
        getCouchViewResultValuesWithNamedDesignDoc: getCouchViewResultValuesWithNamedDesignDoc,
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

    return couchUtils;
};
