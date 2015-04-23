var config = require('../config');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('lodash');

var couchApp = require('./components/couchApp');
var crmQueries = require('./components/crmQueries');
var cycleCreation = require('./components/cycleCreation');
var notifications = require('./components/notifications');
var vendorSpecificProductQueries = require('./components/vendorSpecificProductQueries');

function _enableCors(carliMiddleware) {
    carliMiddleware.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-AuthToken");
        next();
    });
}

function couchDbProxy() {
    return function (req, res, next) {
        var proxyPath = req.path.match(RegExp("^\\/db/(.*)$"));
        if (proxyPath) {
            var dbUrl = 'http://localhost:5984/' + proxyPath[1];
            req.pipe(request({
                uri: dbUrl,
                method: req.method,
                qs: req.query
            })).pipe(res);
        } else {
            next();
        }
    };
}

function runMiddlewareServer(){
    var carliMiddleware = express();
    carliMiddleware.use(bodyParser.json());
    _enableCors(carliMiddleware);

    carliMiddleware.use(couchDbProxy());

    carliMiddleware.get('/version', function (req, res) {
        res.send({ version: require('./package.json').version });
    });

    carliMiddleware.put('/design-doc/:dbName', function (req, res) {
        couchApp.putDesignDoc(req.params.dbName, 'Cycle').then(function() {
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

    carliMiddleware.get('/products-with-offerings-for-vendor/:vendorId/for-cycle/:cycleId', function (req, res) {
        var authToken = JSON.parse(req.header('X-AuthToken'));
        if (!authToken) {
            res.status(401).send('missing authorization cookie');
            return;
        }
        if (!authToken.vendorId) {
            res.status(400).send('invalid auth token');
            return;
        }
        var vendorId = authToken.vendorId;
        vendorSpecificProductQueries.listProductsWithOfferingsForVendorId(vendorId, req.params.cycleId)
            .then(function(products){
                res.send(products);
            }).catch(function (err) {
                res.send( { error: err } );
            });
    });

    carliMiddleware.put('/cycle-from', function (req, res) {
        cycleCreation.createCycleFrom(req.body.sourceCycle, req.body.newCycleData)
            .then(function(newCycleId){
                res.send({ id: newCycleId });
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
    module.exports = _.extend({}, couchApp, notifications, crmQueries, vendorSpecificProductQueries);
}
