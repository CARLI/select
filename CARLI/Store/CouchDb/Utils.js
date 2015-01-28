var middleware = require('../../../config/environmentDependentModules').middleware,
    Q = require('q'),
    request = require('../../../config/environmentDependentModules').request,
    StoreOptions = require( '../../../config').storeOptions
;

function getCouchViewResults( dbName, viewName, key) {
    var deferred = Q.defer();

    var url = StoreOptions.couchDbUrl + '/' + dbName + '/' + '_design/CARLI/_view/' + viewName;
    if (key) {
        url += '?key="' + key + '"';
    }
    var results = [];
    request({ url: url },
        function ( err, response, body ) {
            var data = JSON.parse( body );

            var error = err || data.error;
            if( error ) {
                deferred.reject( error );
            }
            else if (data.rows) {
                data.rows.forEach(function (row) {
                    if (row.value) {
                        results.push(row.value);
                    }
                });
                deferred.resolve(results);
            }
            else {
                deferred.reject();
            }
        }
    );
    return deferred.promise;
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
    getCouchViewResults: getCouchViewResults,
    makeValidCouchDbName: makeValidCouchDbName,
    createDatabase: createDatabase
};
