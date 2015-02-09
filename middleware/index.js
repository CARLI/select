var config = require('../config');
var express = require('express');
var Q = require('q');
var couchapp = require('couchapp');
var domain = require('domain');

function putDesignDoc(dbName, dbType) {
    var putDocPromise = Q.defer();

    var docName = dbType + '-DesignDoc.js';
    var designDoc = require('../db/' + docName);

    var couchAppDomain = domain.create();

    var url = config.storeOptions.couchDbUrl + '/' + dbName + '/_design/CARLI';

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
    //    console.log("Error Putting Design Document:", err);
    //    putDocPromise.reject("Error Putting Design Document: " + err);
    //});

    return putDocPromise.promise;
}

function _enableCors(carliMiddleware) {
    carliMiddleware.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
}

function runMiddlewareServer(){
    var carliMiddleware = express();
    _enableCors(carliMiddleware);
    carliMiddleware.put('/design-doc/:dbName', function (req, res) {
        putDesignDoc(req.params.dbName, 'Cycle').then(function() {
            res.send({ status: 'Ok' });
        }).catch(function (err) {
            res.send( { error: err } );
        });
    });

    var server = carliMiddleware.listen(config.middleware.port, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('CARLI Middleware listening at http://%s:%s', host, port);

    });
}


if (require.main === module) {
    runMiddlewareServer();
}
else {
    module.exports = {
        putDesignDoc: putDesignDoc
    }
}
