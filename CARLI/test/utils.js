var config = require('../config');
var request = config.request;
var testDbMarker = 'mocha-unit-test';
var Q = require('q');

function _deleteDb(dbName) {
    var deferred = Q.defer();
    request.del(config.storeOptions.couchDbUrl + '/' + dbName, function() {
        deferred.resolve();
    });
    return deferred.promise;
}

module.exports = {
    testDbMarker: testDbMarker,
    deleteTestDbs: function() {
        var deferred = Q.defer();

        request.get(config.storeOptions.couchDbUrl + '/_all_dbs', function (error, response, body) {
            if (error) {
                deferred.reject(error);
            }
            var dbList = JSON.parse(body);
            var count = 0;
            var promises = [];
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
    }
};