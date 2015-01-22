var config = require('../CARLI/config');
var couchapp = require('couchapp');
var fs = require('fs');
var Q = require('q');

var request = config.request;

function getDbUrl(dbName) {
    return config.storeOptions.couchDbUrl + '/' + dbName;
}

function makePromise(fun) {
    var deferred = Q.defer();
    fun(deferred);
    return deferred.promise;
}

function putDesignDoc(dbName) {
    var designDoc = require('./CARLI-DesignDoc.js');

    return function() {
        return makePromise(function(deferred) {
            var url = getDbUrl(dbName) + '/_design/CARLI';
            couchapp.createApp(designDoc, url, function(app) {
                console.log("Putting design doc for " + dbName);
                app.push();
                deferred.resolve();
            });
        });
    }
}

function recreateDb(dbName) {
    var dbUrl = getDbUrl(dbName);

    return makePromise(function(deferred) {
        request.del(dbUrl, function () {
            request.put(dbUrl, function () {
                console.log("Created database " + dbName);
                deferred.resolve();
            });
        });
    });
}

function main() {
    recreateDb('carli').then(putDesignDoc('carli'));
}

if (require.main === module) {
    // called directly
    main();
} else {
    // required as a module
}
