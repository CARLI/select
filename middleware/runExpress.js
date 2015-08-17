var cluster = require('cluster');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var _ = require('lodash');

var config = require('../config');
var request = require('../config/environmentDependentModules/request');
var auth = require('./components/auth');
var carliAuth = require('../CARLI/Auth');
var couchApp = require('./components/couchApp');
var crmQueries = require('./components/crmQueries');
var cycleCreation = require('./components/cycleCreation');
var libraryQueries = require('./components/libraryQueries');
var notifications = require('./components/notifications');
var pdf = require('./components/pdf');
var user = require('./components/user');
var vendorDatabases = require('./components/vendorDatabases');
var vendorReportCsv = require('./components/csv/vendorReport');
var vendorSpecificProductQueries = require('./components/vendorSpecificProductQueries');

function runMiddlewareServer(){
    var carliMiddleware = express();

    configureMiddleware();
    defineRoutes();
    launchServer();

    function configureMiddleware() {
        carliMiddleware.use(corsHeaders);
        carliMiddleware.use(bodyParser.json());
        carliMiddleware.use(cookieParser());
        carliMiddleware.use(setAuthForRequest);
    }

    function launchServer() {
        var server = carliMiddleware.listen(config.middleware.port, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log('CARLI Middleware worker ' + cluster.worker.id + ' listening at http://%s:%s', host, port);
        });
    }

    function defineRoutes() {
        carliMiddleware.post('/login', function (req, res) {
            auth.createSession(req.body)
                .then(copyAuthCookieFromResponse)
                .then(sendResult(res))
                .catch(sendError(res));

            function copyAuthCookieFromResponse(authResponse) {
                res.append('Set-Cookie', authResponse.authCookie);
                return authResponse;
            }
        });
        carliMiddleware.delete('/login', function (req, res) {
            auth.deleteSession()
                .then(clearAuthCookie)
                .then(sendResult(res))
                .catch(sendError(res));

            function clearAuthCookie(authResponse) {
                res.append('Set-Cookie', 'AuthSession=; Version=1; Expires=-1; Max-Age=-1; Path=/');
                request.clearAuth();
                return authResponse;
            }
        });
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
                .catch(send500Error(res));
        });
        carliMiddleware.get('/library/:id', function (req, res) {
            crmQueries.loadLibrary(req.params.id)
                .then(sendResult(res))
                .catch(send500Error(res));
        });
        carliMiddleware.get('/list-selections-for-library/:libraryId/from-cycle/:cycleId', function (req, res) {
            libraryQueries.listSelectionsForLibraryFromCycle(req.params.libraryId, req.params.cycleId)
                .then(sendResult(res))
                .catch(send500Error(res));
        });
        carliMiddleware.get('/list-offerings-for-library-with-expanded-products/:libraryId/from-cycle/:cycleId', function (req, res) {
            libraryQueries.listOfferingsForLibraryWithExpandedProducts(req.params.libraryId, req.params.cycleId)
                .then(sendResult(res))
                .catch(send500Error(res));
        });
        carliMiddleware.get('/get-historical-selection-data-for-library/:libraryId/for-product/:productId/from-cycle/:cycleId', function (req, res) {
            libraryQueries.getHistoricalSelectionDataForLibraryForProduct(req.params.libraryId, req.params.productId, req.params.cycleId)
                .then(sendResult(res))
                .catch(send500Error(res));
        });
        carliMiddleware.get('/products-with-offerings-for-vendor/:vendorId/for-cycle/:cycleId', function (req, res) {
            vendorSpecificProductQueries.listProductsWithOfferingsForVendorId(req.params.vendorId, req.params.cycleId)
                .then(sendResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.put('/cycle-from', function (req, res) {
            return carliAuth.requireStaff().then(createCycle);

            function createCycle() {
                return cycleCreation.create(req.body.newCycleData)
                    .then(function (newCycleId) {
                        res.send({ id: newCycleId });
                        cluster.worker.send({
                            command: 'launchCycleDatabaseWorker',
                            sourceCycleId: req.body.sourceCycle.id,
                            newCycleId: newCycleId
                        });
                    }).catch(function (err) {
                        res.send({ error: err });
                    });
            }
        });
        carliMiddleware.get('/cycle-creation-status/:id', function (req, res) {
            return carliAuth.requireStaff().then(getCycleCreationStatus);

            function getCycleCreationStatus() {
                return cycleCreation.getCycleCreationStatus(req.params.id)
                    .then(sendResult(res))
                    .catch(sendError(res));
            }
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
        carliMiddleware.post('/update-su-pricing-for-product/:vendorId/:cycleId/:productId', function (req, res) {

            if ( !req.body || !req.body.newSuPricing ){
                res.status(400).send('missing pricing data');
                return;
            }

            vendorSpecificProductQueries.updateSuPricingForProduct(req.params.vendorId, req.params.productId, req.body.newSuPricing, req.params.cycleId)
                .then(sendResult(res))
                .catch(sendError(res));

        });
        carliMiddleware.post('/update-su-comment-for-product/:vendorId/:cycleId/:productId', function (req, res) {

            if ( !req.body || !req.body.comment || !req.body.users ){
                res.status(400).send('missing comment data');
                return;
            }

            vendorSpecificProductQueries.updateSuCommentForProduct(req.params.vendorId, req.params.productId, req.body.users, req.body.comment, req.params.cycleId)
                .then(sendResult(res))
                .catch(sendError(res));

        });

        carliMiddleware.post('/update-flagged-offerings-for-vendor/:vendorId/for-cycle/:cycleId', function (req, res) {
            vendorDatabases.updateFlaggedOfferingsForVendor(req.params.vendorId, req.params.cycleId)
                .then(sendOk(res))
                .catch(sendError(res));
        });

        carliMiddleware.get('/user', function (req, res) {
            user.list()
                .then(sendResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/user/:email', function (req, res) {
            user.load(req.params.email)
                .then(sendResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.post('/user', function (req, res) {
            user.create(req.body)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.put('/user/:email', function (req, res) {
            user.update(req.body)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/user/:email/reset', function (req, res) {
            var baseUrl = req.protocol + '://' + req.hostname;
            user.requestPasswordReset(req.params.email, baseUrl)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/user/validate-key/:key', function (req, res) {
            user.isKeyValid(req.params.key)
                .then(sendResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.put('/user/consume-key/:key', function (req, res) {
            user.consumeKey(req.params.key, req.body)
                .then(sendOk(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/pdf/content/:notificationId', function(req, res) {
            pdf.contentForPdf(req.params.notificationId)
                .then(function(pdfContent){
                    res.send(pdfContent.html);
                })
                .catch(sendError(res));
        });
        carliMiddleware.get('/pdf/export/:notificationId', function(req, res) {
            pdf.exportPdf(req.params.notificationId)
                .then(function(exportResults){
                    res.setHeader('Content-Disposition', 'attachment; filename="'+ exportResults.fileName +'"');
                    res.send(exportResults.pdf);
                })
                .catch(sendError(res));
        });

        carliMiddleware.get('/csv/data/:notificationId', function(req, res) {
            vendorReportCsv.contentForVendorReport(req.params.notificationId)
                .then(function(dataForReport){
                    res.send(dataForReport);
                })
                .catch(sendError(res));
        });
        carliMiddleware.get('/csv/export/:notificationId', function(req, res) {
            vendorReportCsv.exportCsvForVendorReport(req.params.notificationId)
                .then(function(exportResults){
                    res.setHeader('Content-Disposition', 'attachment; filename="'+ exportResults.fileName +'"');
                    res.type('csv');
                    res.send(exportResults.csv);
                })
                .catch(sendError(res));
        });
        carliMiddleware.get('/next-batch-id', function(req, res) {
            pdf.generateNextBatchId()
                .then(sendJsonResult(res))
                .catch(sendError(res));
        });
        carliMiddleware.get('/next-invoice-number', function(req, res) {
            pdf.generateNextInvoiceNumber()
                .then(sendJsonResult(res))
                .catch(sendError(res));
        });
    }
}

function sendResult(res) {
    return function (result) {
        res.send(result);
    }
}
function sendJsonResult(res){
    return function(result){
        res.send( { result: result } );
    }
}
function sendOk(res) {
    return function() {
        res.send( { status: 'Ok' } );
    }
}
function sendError(res, errorCode) {
    if (!errorCode) {
        errorCode = 500;
    }
    return function(err) {
        if (err.statusCode) {
            errorCode = err.statusCode;
        }
        res.status(errorCode).send( { error: err } );
    }
}

function send500Error(res) {
    return function(err) {
        res.status(500).send( { error: err } );
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

function setAuthForRequest(req, res, next) {
    if (req.url !== '/login') {
        if (req.cookies && req.cookies.AuthSession) {
            request.setAuth(req.cookies.AuthSession);
        } else {
            request.clearAuth();
        }
        res.on('finish', request.clearAuth);
    }
    next();
}

if (require.main === module) {
    runMiddlewareServer();
}
else {
    module.exports = {};
}
