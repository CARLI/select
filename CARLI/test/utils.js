var config = require('../../config');
var request = require('request');
var Store = require( '../Store' );
var Q = require('q');

var testDbName = 'test-db';
var testDbMarker = 'test-db-marker';
var testStore = null;

function getTestStoreOptions() {
    return {
        couchDbUrl: config.storeOptions.couchDbUrl,
        couchDbName: testDbName
    };
}

function _deleteDb(couchDbUrl, dbName) {
    var deferred = Q.defer();
    request.del(couchDbUrl + '/' + dbName, function() {
        deferred.resolve();
    });
    return deferred.promise;
}

var createdDb = false;
function _createMainTestDb () {
    if (!createdDb) {
        request.put(config.storeOptions.couchDbUrl + '/' + testDbName);
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
        //_createMainTestDb();
    },
    deleteTestDbs: function() {
        var deferred = Q.defer();

        request.get(config.storeOptions.couchDbUrl + '/_all_dbs', function (error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var dbList = JSON.parse(body);
            var count = 0;
            var promises = [];
            promises.push(_deleteDb(config.storeOptions.couchDbUrl, testDbName));
            dbList.forEach(function (dbName) {
                if (dbName.indexOf(testDbMarker) >= 0) {
                    count++;
                    // request.del(config.storeOptions.couchDbUrl + '/' + dbName);
                    promises.push(_deleteDb(config.storeOptions.couchDbUrl, dbName));
                }
            });
            console.log('Deleted ' + count + ' databases');
            Q.all(promises).then(deferred.resolve);
        });

        return deferred.promise;
    },
    deleteTestReplicators: function() {
        var deferred = Q.defer();

        request.get(config.storeOptions.couchDbUrl + '/_replicator/_all_docs?include_docs=true', function (error, response, body) {
            if (error) {
                deferred.reject(error);
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

            request.del(config.storeOptions.couchDbUrl + '/_replicator/' + id + '?rev=' + rev, function (error, response, body) {
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
            couchDbUrl = config.storeOptions.couchDbUrl;
        }

        var deferred = Q.defer();
        request.get(couchDbUrl + '/_all_dbs', function (error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var dbList = JSON.parse(body);
            var count = 0;
            var promises = [];
            promises.push(_deleteDb(couchDbUrl, testDbName));
            dbList.forEach(function (dbName) {
                if (dbName.indexOf('_') != 0) {
                    count++;
                    //request.del(couchDbUrl + '/' + dbName);
                    promises.push(_deleteDb(couchDbUrl, dbName));
                }
            });
            console.log('Deleted ' + count + ' databases');
            Q.all(promises).then(deferred.resolve);
        });
        return deferred.promise;
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
