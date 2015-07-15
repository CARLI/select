var config = require('../../config');
var request = require('request');
var Store = require( '../Store' );
var Q = require('q');

var testDbName = 'test-db';
var testDbMarker = 'test-db-marker';
var testStore = null;
var testStoreOptions = getTestStoreOptions();

function getTestStoreOptions() {
    return {
        privilegedCouchDbUrl: config.storeOptions.privilegedCouchDbUrl,
        couchDbUrl: config.storeOptions.privilegedCouchDbUrl,
        couchDbName: testDbName
    };
}

function _deleteDb(couchDbUrl, dbName) {
    var deferred = Q.defer();
    request.del(couchDbUrl + '/' + dbName, function(error, response, body) {
        var parsedBody = {};
        if ( body ){
            parsedBody = JSON.parse(body);
        }

        var err = error || parsedBody.error;
        if (err){
            deferred.reject(err);
        }
        deferred.resolve();
    });
    return deferred.promise;
}

var createdDb = false;
function _createMainTestDb () {
    if (!createdDb) {
        request.put(testStoreOptions.privilegedCouchDbUrl + '/' + testDbName);
        createdDb = true;
    }
}

module.exports = {
    testDbName: testDbName,
    testDbMarker: testDbMarker,
    getTestDbStoreOptions: getTestStoreOptions,
    getTestDbStore: function () {
        if (!testStore) {
            var storeOptions = getTestStoreOptions();
            var storeModule = require( '../Store/' + config.storePath )( storeOptions );
            testStore = Store( storeModule );
        }
        return testStore;
    },
    setupTestDb: function () {
        config.setDbName(testDbName);
        config.storeOptions = getTestStoreOptions();
        config.setStoreOptionsForCycles( getTestStoreOptions() );
    },
    deleteTestDbs: function() {
        var deferred = Q.defer();

        console.log(testStoreOptions.privilegedCouchDbUrl);
        request.get(testStoreOptions.privilegedCouchDbUrl + '/_all_dbs', function (error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var dbList = JSON.parse(body);
            var count = 0;
            var promises = [];
            promises.push(_deleteDb(testStoreOptions.privilegedCouchDbUrl, testDbName));
            dbList.forEach(function (dbName) {
                if (dbName.indexOf(testDbMarker) >= 0) {
                    count++;
                    // request.del(testStoreOptions.privilegedCouchDbUrl + '/' + dbName);
                    promises.push(_deleteDb(testStoreOptions.privilegedCouchDbUrl, dbName));
                }
            });
            console.log('Deleted ' + count + ' databases');
            Q.all(promises).then(deferred.resolve);
        });

        return deferred.promise;
    },
    deleteTestReplicators: function() {
        var deferred = Q.defer();

        console.log(testStoreOptions.privilegedCouchDbUrl);
        request.get(testStoreOptions.privilegedCouchDbUrl + '/_replicator/_all_docs?include_docs=true', function (error, response, body) {
            var parsedBody = JSON.parse(body);
            var err = error || parsedBody.error;
            if (err) {
                deferred.reject(error);
                return;
            }
            var jsonBody = JSON.parse(body);
            var replicationList = jsonBody.rows;
            var count = 0;
            var promises = [];

            replicationList.forEach(function (replication) {
                if (replication.doc.hasOwnProperty('source') && replication.doc.source.indexOf(testDbMarker) >= 0) {
                    count++;
                    promises.push( promiseDeletion(replication.doc._id, replication.doc._rev) );
                }
            });
            console.log('Deleted ' + count + ' replicator documents');
            Q.all(promises).then(deferred.resolve);
        });

        function promiseDeletion(id, rev) {
            var deletion = Q.defer();

            request.del(testStoreOptions.privilegedCouchDbUrl + '/_replicator/' + id + '?rev=' + rev, function (error, response, body) {
                var parsedBody = JSON.parse(body);
                var err = error || parsedBody.error;
                if (err) {
                    console.log('Failed to delete ' + id + ' rev: '+ rev +', ' + err + ': ' + parsedBody.reason);
                    console.log('Run `grunt delete-test-dbs` to clean this up');
                    deletion.reject(error);
                } else {
                    deletion.resolve();
                }
            });

            return deletion.promise;
        }

        return deferred.promise;
    },
    nukeCouch: function(couchDbUrl) {
        if (couchDbUrl === undefined) {
            couchDbUrl = testStoreOptions.privilegedCouchDbUrl;
        }

        console.log('Nuke couch at '+couchDbUrl);

        //return deleteAllReplicators()
        return deleteAllNonSystemDatabases()
            .catch(function(err){
                console.log('Error nuking couch', err);
            });

        function deleteAllReplicators() {
            var deferred = Q.defer();
            request.get(couchDbUrl + '/_replicator/_all_docs?include_docs=true', function (error, response, body) {
                var parsedBody = JSON.parse(body);
                var err = error || parsedBody.error;
                if (err) {
                    deferred.reject(error);
                    return;
                }
                var replicationList = parsedBody.rows;
                var count = 0;
                var promises = [];

                replicationList.forEach(function (replication) {
                    if (replication.doc._id.indexOf('_') != 0) {
                        count++;
                        promises.push(promiseDeletion(replication.doc._id, replication.doc._rev));
                    }
                });
                Q.all(promises)
                    .then(function(){
                        console.log('Deleted ' + count + ' replicator documents');
                        deferred.resolve();
                    });
            });
            return deferred.promise;
        }
        function promiseDeletion(id, rev) {
            var deletion = Q.defer();

            request.del(couchDbUrl + '/_replicator/' + id + '?rev=' + rev, function (error, response, body) {
                var parsedBody = JSON.parse(body);
                var err = error || parsedBody.error;
                if (err) {
                    console.log('Failed to delete ' + id + ' rev: '+ rev +', ' + err + ': ' + parsedBody.reason);
                    deletion.reject(err);
                } else {
                    deletion.resolve();
                }
            });

            return deletion.promise;
        }

        function deleteAllNonSystemDatabases() {
            var deferred = Q.defer();
            request.get(couchDbUrl + '/_all_dbs', function(error, response, body) {
                    if (error) {
                        deferred.reject(error);
                    }
                    var dbList = JSON.parse(body);
                    var count = 0;
                    var promises = [];
                    promises.push(_deleteDb(couchDbUrl, testDbName));
                    dbList.forEach(
                        function(dbName) {
                            if (dbName.indexOf('_') != 0) {
                                count++;
                                //request.del(couchDbUrl + '/' + dbName);
                                promises.push(_deleteDb(couchDbUrl, dbName));
                            }
                        }
                    );
                    Q.all(promises)
                        .then(function(){
                            console.log('Deleted ' + count + ' databases');
                            deferred.resolve();
                        })
                        .catch(function(err){
                            console.log('error deleting databases ',err);
                        });
                }
            );
            return deferred.promise;
        }
    },
    deleteDocumentsOfType: function(entityTypeName){
        var EntityRepository = require('../Entity/'+entityTypeName+'Repository' );
        return EntityRepository.list()
            .then(function(entityList){
                return Q.allSettled(entityList.map(function(entity){
                    return EntityRepository.delete(entity.id);
                }));
            });
    }
};
