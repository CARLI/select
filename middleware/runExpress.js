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

function runMiddlewareServer(){
    var carliMiddleware = express();

    configureMiddleware();
    defineRoutes();
    launchServer();

    function configureMiddleware() {
        carliMiddleware.use(corsHeaders);
        carliMiddleware.use(couchDbProxy);
        carliMiddleware.use(bodyParser.json());
    }

    function launchServer() {
        var server = carliMiddleware.listen(config.middleware.port, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('CARLI Middleware worker ' + cluster.worker.id + ' listening at http://%s:%s', host, port);
        });
    }

    function defineRoutes() {
        carliMiddleware.get('/version', function (req, res) {
            res.send({ version: require('./package.json').version });
        });
        carliMiddleware.put('/design-doc/:dbName', function (req, res) {
            couchApp.putDesignDoc(req.params.dbName, 'Cycle')
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.put('/tell-pixobot', function (req, res) {
            notifications.tellPixobot(req.body);
            res.send(req.body);
        });
        carliMiddleware.get('/library', function (req, res) {
            crmQueries.listLibraries()
                .then(sendResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/library/:id', function (req, res) {
            crmQueries.loadLibrary(req.params.id)
                .then(sendResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/products-with-offerings-for-vendor/:vendorId/for-cycle/:cycleId', function (req, res) {
            var authToken = getAuthTokenFromHeader(req);
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
                .then(sendResult(res))
                .catch(sendError(res));
            ;
        });
        carliMiddleware.put('/cycle-from', function (req, res) {
            cycleCreation.create(req.body.newCycleData)
                .then(function (newCycleId) {
                    res.send({ id: newCycleId });
                    console.log('Asking master to launchCycleDatabaseWorker');
                    cluster.worker.send({
                        command: 'launchCycleDatabaseWorker',
                        sourceCycleId: req.body.sourceCycle.id,
                        newCycleId: newCycleId
                    });
                }).catch(function (err) {
                    res.send({ error: err });
                });
        });
        carliMiddleware.get('/cycle-creation-status/:id', function (req, res) {
            cycleCreation.getCycleCreationStatus(req.params.id)
                .then(sendResult(res))
                .catch(sendError(res));
            ;
        });
        carliMiddleware.get('/create-all-vendor-databases', function (req, res) {
            vendorDatabases.createVendorDatabasesForAllCycles()
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/replicate-all-data-to-vendors', function (req, res) {
            vendorDatabases.replicateDataToVendorsForAllCycles()
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/replicate-all-data-from-vendors', function (req, res) {
            vendorDatabases.replicateDataFromVendorsForAllCycles()
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/create-vendor-databases-for-cycle/:cycleId', function (req, res) {
            vendorDatabases.createVendorDatabasesForCycle(req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/replicate-data-to-vendors-for-cycle/:cycleId', function (req, res) {
            vendorDatabases.replicateDataToVendorsForCycle(req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/replicate-data-to-one-vendor-for-cycle/:vendorId/:cycleId', function(req, res) {
            vendorDatabases.replicateDataToOneVendorForCycle(req.params.vendorId,req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/replicate-data-from-vendors-for-cycle/:cycleId', function (req, res) {
            vendorDatabases.replicateDataFromVendorsForCycle(req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/sync', function (req, res) {
            console.log('Asking master to launchSynchronizationWorker');
            cluster.worker.send({
                command: 'launchSynchronizationWorker'
            });
            sendOk(res);
        });
        carliMiddleware.get('/index-all-cycles', function (req, res) {
            vendorDatabases.triggerIndexingForAllCycles()
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/index-cycle/:cycleId', function (req, res) {
            vendorDatabases.triggerIndexingForCycleId(req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/cycle-database-status/', function (req, res) {
            vendorDatabases.getCycleStatusForAllVendorsAllCycles()
                .then(function (arrayOfStatusObjects) {
                    res.send(arrayOfStatusObjects);
                })
                .catch(function (err) {
                    res.send({ error: err });
                });
        });
        carliMiddleware.get('/cycle-database-status/:cycleId', function (req, res) {
            vendorDatabases.getCycleStatusForAllVendors(req.params.cycleId)
                .then(function (arrayOfStatusObjects) {
                    res.send(arrayOfStatusObjects);
                })
                .catch(function (err) {
                    res.send({ error: err });
                });
        });
        carliMiddleware.get('/cycle-database-status/:cycleId/for-vendor/:vendorId', function (req, res) {
            vendorDatabases.getCycleStatusForVendorId(req.params.vendorId, req.params.cycleId)
                .then(function (statusObject) {
                    res.send(statusObject);
                })
                .catch(function (err) {
                    res.send({ error: err });
                });
        });
        carliMiddleware.post('/update-su-pricing-for-product/:cycleId/:productId', function (req, res) {
            var authToken = getAuthTokenFromHeader(req);
            if (!authToken) {
                res.status(401).send('missing authorization cookie');
                return;
            }
            if (!authToken.vendorId) {
                res.status(400).send('invalid auth token');
                return;
            }
            var vendorId = authToken.vendorId;

            var newSuPricing = {};
            if ( !req.body || !req.body.newSuPricing ){
                res.status(400).send('missing pricing data');
                return;
            }

            vendorSpecificProductQueries.updateSuPricingForProduct(req.params.productId, vendorId, req.body.newSuPricing, req.params.cycleId)
                .then(sendResult(res))
                .catch(sendError(res));

        });

        carliMiddleware.post('/update-flagged-offerings-for-vendor/:vendorId/for-cycle/:cycleId', function (req, res) {
            vendorDatabases.updateFlaggedOfferingsForVendor(req.params.vendorId, req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });


    }
}

function sendResult(res) {
    return function (result) {
        res.send(result);
    }
}
function sendOk(res) {
    return function() {
        res.send( { status: 'Ok' } );
    }
}
function sendError(res) {
    return function(err) {
        res.send( { error: err } );
    }
}

function getAuthTokenFromHeader(req) {
    if ( req && req.header('X-AuthToken') ){
        return JSON.parse(req.header('X-AuthToken'));
    }
    return null;
}


function corsHeaders(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-AuthToken");
    next();
}

function couchDbProxy(req, res, next) {
    var proxyPath = req.path.match(RegExp("^\\/db/(.*)$"));
    if (proxyPath) {
        var dbUrl = 'http://localhost:5984/' + proxyPath[ 1 ];
        req.pipe(request({
            uri: dbUrl,
            method: req.method,
            qs: req.query
        })).pipe(res);
    } else {
        next();
    }
}

if (require.main === module) {
    runMiddlewareServer();
}
else {
    module.exports = {};
}
