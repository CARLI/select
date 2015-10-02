var Q = require('q');
var config = require('../../config');
var couchapp = require('couchapp');
// var domain = require('domain');

function putDesignDoc(dbName, dbType) {
    var putDocPromise = Q.defer();

    var docName = dbType + '-DesignDoc.js';
    var designDoc = require('../../db/designDocs/' + docName);

    // var couchAppDomain = domain.create();

    var url = config.storeOptions.privilegedCouchDbUrl + '/' + dbName + '/_design/CARLI';

    /*
     *  Running couchApp in its own domain allows you to actually see and deal with errors that it throws.
     *  The negative side effect is that any code that follows the putDocPromise will also be error-handled by this domain,
     *  because all code executed from this promise's .then() and afterwards is run inside that domain as well.
     */

    //couchAppDomain.run(function() {
    couchapp.createApp(designDoc, url, function(app) {
        app.push(function() {
            putDocPromise.resolve();
        });
    });
    //});

    //couchAppDomain.on('error', function(err) {
    //    Logger.log("Error Putting Design Document:", err);
    //    putDocPromise.reject("Error Putting Design Document: " + err);
    //});

    return putDocPromise.promise;
}

module.exports = {
    putDesignDoc: putDesignDoc
};
