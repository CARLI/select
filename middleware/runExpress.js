var cluster = require('cluster');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var _ = require('lodash');

var config = require('../config');
var couchApp = require('./components/couchApp');
var crmQueries = require('./components/crmQueries');
var cycleCreation = require('./components/cycleCreation');
var notifications = require('./components/notifications');
var vendorDatabases = require('./components/vendorDatabases');
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
        cycleCreation.create(req.body.newCycleData)
            .then(function(newCycleId){
                res.send({ id: newCycleId });
                console.log('Asking master to launchCycleDatabaseWorker');
                cluster.worker.send({
                    command: 'launchCycleDatabaseWorker',
                    sourceCycleId: req.body.sourceCycle.id,
                    newCycleId: newCycleId
                });
            }).catch(function (err) {
                res.send( { error: err } );
            });
    });

    carliMiddleware.get('/cycle-creation-status/:id', function(req, res){
        cycleCreation.getCycleCreationStatus( req.params.id )
            .then(function(statusObject){
                res.send( statusObject );
            })
            .catch(function(err){
                res.send( { error: err } );
            });
    });

    carliMiddleware.get('/create-all-vendor-databases', function(req, res) {
        vendorDatabases.createVendorDatabasesForAllCycles()
            .then(sendOk(res))
            .catch(sendError(res));
    });
    carliMiddleware.get('/replicate-all-data-to-vendors', function(req, res) {
        vendorDatabases.replicateDataToVendorsForAllCycles()
            .then(sendOk(res))
            .catch(sendError(res));
    });
    carliMiddleware.get('/replicate-all-data-from-vendors', function(req, res) {
        vendorDatabases.replicateDataFromVendorsForAllCycles()
            .then(sendOk(res))
            .catch(sendError(res));
    });
    carliMiddleware.get('/create-vendor-databases-for-cycle/:cycleId', function(req, res) {
        vendorDatabases.createVendorDatabasesForCycle(req.params.cycleId)
            .then(sendOk(res))
            .catch(sendError(res));
    });
    carliMiddleware.get('/replicate-data-to-vendors-for-cycle/:cycleId', function(req, res) {
        vendorDatabases.replicateDataToVendorsForCycle(req.params.cycleId)
            .then(sendOk(res))
            .catch(sendError(res));
    });
    carliMiddleware.get('/replicate-data-from-vendors-for-cycle/:cycleId', function(req, res) {
        vendorDatabases.replicateDataFromVendorsForCycle(req.params.cycleId)
            .then(sendOk(res))
            .catch(sendError(res));
    });


    carliMiddleware.get('/cycle-database-status/', function(req, res) {
        vendorDatabases.getCycleStatusForAllVendorsAllCycles()
            .then(function(arrayOfStatusObjects){
                res.send( arrayOfStatusObjects );
            })
            .catch(function(err){
                res.send( { error: err } );
            });
    });
    carliMiddleware.get('/cycle-database-status/:cycleId', function(req, res) {
        vendorDatabases.getCycleStatusForAllVendors(req.params.cycleId)
            .then(function(arrayOfStatusObjects){
                res.send( arrayOfStatusObjects );
            })
            .catch(function(err){
                res.send( { error: err } );
            });
    });
    carliMiddleware.get('/cycle-database-status/:cycleId/for-vendor/:vendorId', function(req, res) {
        vendorDatabases.getCycleStatusForVendorId(req.params.vendorId, req.params.cycleId)
            .then(function(statusObject){
                res.send( statusObject );
            })
            .catch(function(err){
                res.send( { error: err } );
            });
    });

    function sendOk(res) {
        return function() {
            res.send( { status: 'ok' } );
        }
    }
    function sendError(res) {
        return function(err) {
            res.send( { error: err } );
        }
    }

    var server = carliMiddleware.listen(config.middleware.port, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log('CARLI Middleware worker '+ cluster.worker.id + ' listening at http://%s:%s', host, port);

    });
}

if (require.main === module) {
    runMiddlewareServer();
}
else {
    module.exports = {};
}
