var config = require('../config');
var express = require('express');
var Q = require('q');
var couchapp = require('couchapp');
var domain = require('domain');

function putDesignDoc(dbName) {
    var deferred = Q.defer();

    var docName = 'CARLI-DesignDoc.js';
    var designDoc = require('../db/' + docName);

    var d = domain.create();

    var url = config.storeOptions.couchDbUrl + '/' + dbName + '/_design/CARLI';

    d.run(function() {
        couchapp.createApp(designDoc, url, function(app) {
            app.push(function() {
                deferred.resolve();
            });
        });
    });

    d.on('error', function(err) {
        console.log("Error Putting Design Document:", err);
        deferred.reject("Error Putting Design Document: " + err);
    });

    return deferred.promise;
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
        putDesignDoc(req.params.dbName).then(function() {
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
