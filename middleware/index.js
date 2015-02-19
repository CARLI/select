var config = require('../config');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var couchUtils = require('./components/couchUtils');
var crmQueries = require('./components/crmQueries');
var notifications = require('./components/notifications');

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
    carliMiddleware.use(bodyParser.json());
    _enableCors(carliMiddleware);
    carliMiddleware.put('/design-doc/:dbName', function (req, res) {
        couchUtils.putDesignDoc(req.params.dbName, 'Cycle').then(function() {
            res.send({ status: 'Ok' });
        }).catch(function (err) {
            res.send( { error: err } );
        });
    });
    carliMiddleware.put('/tell-pixobot', function (req, res) {
        notifications.tellPixobot(req.body);
        res.send(req.body);
    });
    carliMiddleware.get('/library', function (req, res) {
        crmQueries.listLibraries().then(function(libraries) {
            res.send(libraries);
        }).catch(function (err) {
            res.send( { error: err } );
        });
    });
    carliMiddleware.get('/library/:id', function (req, res) {
        crmQueries.loadLibrary(req.params.id).then(function(library) {
            res.send(library);
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
    module.exports = _.extend({}, couchUtils, notifications, crmQueries);
}
