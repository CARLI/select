var config = require( '../config'),
    Q = require('q'),
    request = config.request,
    StoreOptions = config.storeOptions
;

var dbHost = db_host = StoreOptions.couchDbUrl + '/' + StoreOptions.couchDbName;

function getCouchViewResults( viewName, key) {
    var deferred = Q.defer();

    var url = dbHost + '/' + '_design/CARLI/_view/' + viewName;
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

module.exports = {
    getCouchViewResults: getCouchViewResults
};
