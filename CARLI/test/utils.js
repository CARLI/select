var config = require('../config');
var request = config.request;
var Store = require( '../Store' );
var Q = require('q');

var testDbName = 'mocha-tests';
var testDbMarker = 'mocha-unit-test';
var testStore = null;

function getTestStoreOptions() {
    return {
        couchDbUrl: config.storeOptions.couchDbUrl,
        couchDbName: testDbName
    };
}

function _deleteDb(dbName) {
    var deferred = Q.defer();
    request.del(config.storeOptions.couchDbUrl + '/' + dbName, function() {
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
            promises.push(_deleteDb(testDbName));
            dbList.forEach(function (dbName) {
                if (dbName.indexOf(testDbMarker) >= 0) {
                    count++;
                    request.del(config.storeOptions.couchDbUrl + '/' + dbName);
                    promises.push(_deleteDb(dbName));
                }
            });
            console.log('Deleted ' + count + ' databases');
            Q.all(promises).then(deferred.resolve);
        });

        return deferred.promise;
    },
    nukeCouch: function() {
        var deferred = Q.defer();

        request.get(config.storeOptions.couchDbUrl + '/_all_dbs', function (error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var dbList = JSON.parse(body);
            var count = 0;
            var promises = [];
            promises.push(_deleteDb(testDbName));
            dbList.forEach(function (dbName) {
                if (dbName.indexOf('_') != 0) {
                    count++;
                    request.del(config.storeOptions.couchDbUrl + '/' + dbName);
                    promises.push(_deleteDb(dbName));
                }
            });
            console.log('Deleted ' + count + ' databases');
            Q.all(promises).then(deferred.resolve);
        });

        return deferred.promise;
    }
};
