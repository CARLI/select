var config = require('../../config');
var request = require('../../config/environmentDependentModules').request;
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
    nukeCouch: function(couchDbUrl) {
        var deferred = Q.defer();
        if (couchDbUrl === undefined) {
            couchDbUrl = config.storeOptions.couchDbUrl;
        }

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
    }
};
