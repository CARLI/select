var cluster = require('cluster');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressCsv = require('express-csv-middleware');
var tmp = require('tmp');
var _ = require('lodash');
var Q = require('q');

var config = require('../config');
var request = require('../config/environmentDependentModules/request');
var auth = require('./components/auth');
var carliAuth = require('../CARLI/Auth');
var couchApp = require('./components/couchApp');
var crmQueries = require('./components/crmQueries');
var cycleCreation = require('./components/cycleCreation');
var libraryQueries = require('./components/libraryQueries');
var email = require('./components/email');
var pdf = require('./components/pdf');
var reports = require('./components/reports');
var user = require('./components/user');
var vendorDatabases = require('./components/vendorDatabases');
var vendorPricingCsv = require('./components/csv/vendorPricingCsv');
var vendorReportCsv = require('./components/csv/vendorReport');
var vendorSpecificProductQueries = require('./components/vendorSpecificProductQueries');
var publicApi = require('./components/public');
var restrictedApi = require('./components/restrictedApi');

function runMiddlewareServer(){
    var carliMiddleware = express();

    configureMiddleware();
    defineRoutes();
    launchServer();

    function configureMiddleware() {
        carliMiddleware.use(corsHeaders);
        carliMiddleware.use(handleCsvUploads());
        carliMiddleware.use(bodyParser.json());
        carliMiddleware.use(cookieParser());
        carliMiddleware.use(setAuthForRequest);
    }

    function launchServer() {
        var server = carliMiddleware.listen(config.middleware.port, function () {
            var host = server.address().address;
            var port = server.address().port;
            Logger.log('CARLI Middleware worker ' + cluster.worker.id + ' listening at http://%s:%s', host, port);
        });
    }

    function defineRoutes() {

        function authorizedRoute(method, route, promiseToAuthorize, dispatchRequest) {
            carliMiddleware[method](route, function (req, res) {
                promiseToAuthorize(req)
                    .then(function() {
                        dispatchRequest(req, res);
                    })
                    .catch(sendError(res));
            });
        }
        function authorizedRouteWithVendorIdParam(method, route, promiseToAuthorize, dispatchRequest) {
            carliMiddleware[method](route, function (req, res) {
                promiseToAuthorize(req.params.vendorId)
                    .then(function() {
                        dispatchRequest(req, res);
                    })
                    .catch(sendError(res));
            });
        }
        function authorizedRouteExpectingBasicAuth(method, route, promiseToAuthorize, dispatchRequest) {
            carliMiddleware[method](route, function (req, res) {
                try {
                    Q.when(promiseToAuthorize(req))
                        .then(function() {
                            dispatchRequest(req, res);
                        })
                        .catch(sendError(res));
                } catch (e) {
                    sendBasicAuthRequired(res);
                }
            });
        }

        function fixThrowingPromiseWrapper(promise) {
            var returnValue;
            try {
                returnValue = promise();
            } catch (e) {
                return Q.when(e)
            }
        }

        carliMiddleware.get('/version', function (req, res) {
            res.send({ version: require('./package.json').version });
        });

        carliMiddleware.put('/tell-pixobot', function (req, res) {
            email.tellPixobot(req.body);
            res.send(req.body);
        });

        authorizedRoute('put', '/design-doc/:dbName', carliAuth.requireStaff, function (req, res) {
            carliAuth.requireStaff().then(function() {
                couchApp.putDesignDoc(req.params.dbName, 'Cycle')
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
        });

        defineRoutesForAuthentication();
        defineRoutesForLibraries();
        defineRoutesForCycleDatabases();
        defineRoutesForOfferings();
        defineRoutesForUserManagement();
        defineRoutesForExports();
        defineRoutesForInvoices();
        defineRoutesForNotifications();
        defineRoutesForReports();
        defineRoutesForTheDrupalSite();
        defineRoutesForRestrictedApi();

        function defineRoutesForAuthentication() {
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
            authorizedRoute('post', '/masquerade-library/:libraryId', carliAuth.requireStaff, function (req, res) {
                auth.masqueradeAsLibrary(req.params.libraryId)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRoute('post', '/masquerade-vendor/:vendorId', carliAuth.requireStaff, function (req, res) {
                auth.masqueradeAsVendor(req.params.vendorId)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
        }
        function defineRoutesForLibraries() {
            authorizedRoute('get', '/library', carliAuth.requireSession, function (req, res) {
                crmQueries.listLibraries()
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRoute('get', '/library/:id', carliAuth.requireSession, function (req, res) {
                crmQueries.loadLibrary(req.params.id)
                    .then(function(library){
                        if ( isValidLibrary(library) ) {
                            res.send(library);
                        }
                        else {
                            res.status(404).send( { error: 'Library ' + req.params.id + ' not found in CRM DB' } );
                        }
                    })
                    .catch(send500Error(res));

                function isValidLibrary(library) {
                    return library && Object.keys(library).indexOf('name') > -1;
                }
            });
            authorizedRoute('get', '/library/contacts/:id', carliAuth.requireSession, function (req, res) {
                crmQueries.listCrmContactsForLibrary(req.params.id)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRoute('get', '/library/contacts/for-ids/:ids', carliAuth.requireSession, function (req, res) {
                var idArray = [];
                try {
                    idArray = JSON.parse(req.params.ids);
                }
                catch(e){}

                crmQueries.listCrmContactsForLibraryIds(idArray)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRoute('get', '/list-selections-for-library/:libraryId/from-cycle/:cycleId', carliAuth.requireStaffOrLibrary, function (req, res) {
                libraryQueries.listSelectionsForLibraryFromCycle(req.params.libraryId, req.params.cycleId)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRoute('get', '/list-offerings-for-library-with-expanded-products/:libraryId/from-cycle/:cycleId', carliAuth.requireStaffOrLibrary, function (req, res) {
                libraryQueries.listOfferingsForLibraryWithExpandedProducts(req.params.libraryId, req.params.cycleId)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRoute('get', '/get-historical-selection-data-for-library/:libraryId/for-product/:productId/from-cycle/:cycleId', carliAuth.requireStaffOrLibrary, function (req, res) {
                libraryQueries.getHistoricalSelectionDataForLibraryForProduct(req.params.libraryId, req.params.productId, req.params.cycleId)
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
            authorizedRouteWithVendorIdParam('get', '/products-with-offerings-for-vendor/:vendorId/for-cycle/:cycleId', carliAuth.requireStaffOrLibraryOrSpecificVendor, function (req, res) {
                vendorSpecificProductQueries.listProductsWithOfferingsForVendorId(req.params.vendorId, req.params.cycleId)
                    .then(sendResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/list-notifications-for-library', carliAuth.requireStaffOrLibrary, function (req, res) {
                libraryQueries.listNotificationsForLibrary()
                    .then(sendResult(res))
                    .catch(send500Error(res));
            });
        }
        function defineRoutesForCycleDatabases() {
            authorizedRoute('put', '/cycle-from', carliAuth.requireStaff, function (req, res) {
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
            });
            authorizedRoute('put', '/cycle', carliAuth.requireStaff, function (req, res) {
                return cycleCreation.create(req.body.newCycleData)
                    .then(function (newCycleId) {
                        res.send({ id: newCycleId });
                    }).catch(function (err) {
                        res.send({ error: err });
                    });
            });
            authorizedRoute('get', '/cycle-creation-status/:id', carliAuth.requireStaff, function (req, res) {
                return carliAuth.requireStaff().then(getCycleCreationStatus);
                function getCycleCreationStatus() {
                    return cycleCreation.getCycleCreationStatus(req.params.id)
                        .then(sendResult(res))
                        .catch(sendError(res));
                }
            });
            authorizedRoute('delete', '/delete-cycle/:id', carliAuth.requireStaff, function (req, res) {
                return carliAuth.requireStaff().then(deleteCycle);
                function deleteCycle() {
                    return cycleCreation.deleteCycle(req.params.id)
                        .then(sendResult(res)({success: true}))
                        .catch(sendError(res));
                }
            });
            authorizedRoute('post', '/create-all-vendor-databases', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.createVendorDatabasesForActiveCycles()
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/replicate-all-data-to-vendors', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.replicateDataToVendorsForAllCycles()
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/replicate-all-data-from-vendors', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.replicateDataFromVendorsForAllCycles()
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/create-vendor-databases-for-cycle/:cycleId', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.createVendorDatabasesForCycle(req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/replicate-data-to-vendors-for-cycle/:cycleId', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.replicateDataToVendorsForCycle(req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/replicate-data-to-one-vendor-for-cycle/:vendorId/:cycleId', carliAuth.requireSession, function (req, res) {
                vendorDatabases.replicateDataToOneVendorForCycle(req.params.vendorId, req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/replicate-data-from-vendors-for-cycle/:cycleId', carliAuth.requireSession, function (req, res) {
                vendorDatabases.replicateDataFromVendorsForCycle(req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/replicate-data-from-vendor/:vendorId/for-cycle/:cycleId',  carliAuth.requireSession, function (req, res) {
                vendorDatabases.replicateDataFromOneVendorForCycle(req.params.vendorId, req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/sync', carliAuth.requireStaff, function (req, res) {
                cluster.worker.send({
                    command: 'launchSynchronizationWorker'
                });
                sendOk(res)();
            });
            authorizedRoute('get', '/index-all-cycles', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.triggerIndexingForAllCycles()
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/index-cycle/:cycleId', carliAuth.requireStaff, function (req, res) {
                vendorDatabases.triggerIndexingForCycleId(req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/cycle-database-status/', carliAuth.requireSession, function (req, res) {
                vendorDatabases.getCycleStatusForAllVendorsAllCycles()
                    .then(function (arrayOfStatusObjects) {
                        res.send(arrayOfStatusObjects);
                    })
                    .catch(function (err) {
                        res.send({ error: err });
                    });
            });
            authorizedRoute('get', '/cycle-database-status/:cycleId', carliAuth.requireSession, function (req, res) {
                vendorDatabases.getCycleStatusForAllVendors(req.params.cycleId)
                    .then(function (arrayOfStatusObjects) {
                        res.send(arrayOfStatusObjects);
                    })
                    .catch(function (err) {
                        res.send({ error: err });
                    });
            });
            authorizedRoute('get', '/cycle-database-status/:cycleId/for-vendor/:vendorId', carliAuth.requireSession, function (req, res) {
                vendorDatabases.getCycleStatusForVendorId(req.params.vendorId, req.params.cycleId)
                    .then(function (statusObject) {
                        res.send(statusObject);
                    })
                    .catch(function (err) {
                        res.send({ error: err });
                    });
            });
        }
        function defineRoutesForOfferings() {
            authorizedRouteWithVendorIdParam('post', '/update-su-pricing-for-product/:vendorId/:cycleId/:productId', carliAuth.requireStaffOrSpecificVendor, function (req, res) {
                if (!req.body || !req.body.newSuPricing) {
                    res.status(400).send('missing pricing data');
                    return;
                }
                vendorSpecificProductQueries.updateSuPricingForProduct(req.params.vendorId, req.params.productId, req.body.newSuPricing, req.body.vendorComments, req.params.cycleId)
                    .then(sendResult(res))
                    .catch(sendError(res));
            });
            authorizedRouteWithVendorIdParam('post', '/update-su-comment-for-product/:vendorId/:cycleId/:productId', carliAuth.requireStaffOrSpecificVendor, function (req, res) {
                if (!req.body || !req.body.users || typeof req.body.comment === 'undefined') {
                    res.status(400).send('missing comment data');
                    return;
                }
                vendorSpecificProductQueries.updateSuCommentForProduct(req.params.vendorId, req.params.productId, req.body.users, req.body.comment, req.params.cycleId)
                    .then(sendResult(res))
                    .catch(sendError(res));
            });
            authorizedRouteWithVendorIdParam('post', '/update-flagged-offerings-for-vendor/:vendorId/for-cycle/:cycleId', carliAuth.requireStaffOrSpecificVendor, function (req, res) {
                vendorDatabases.updateFlaggedOfferingsForVendor(req.params.vendorId, req.params.cycleId)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
        }
        function defineRoutesForUserManagement() {
            authorizedRoute('get', '/user', carliAuth.requireSession, function (req, res) {
                user.list()
                    .then(sendResult(res))
                    .catch(sendError(res));
            });
            carliMiddleware.get('/user/:email', function (req, res) {
                user.load(req.params.email)
                    .then(sendResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/user', carliAuth.requireStaffOrLibrary, function (req, res) {
                user.create(req.body)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('put', '/user/:email', carliAuth.requireStaffOrLibrary, function (req, res) {
                user.update(req.body)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('delete', '/user/:email', carliAuth.requireStaff, function (req, res) {
                user.delete(req.body)
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
            carliMiddleware.put('/notify-user-creation', function (req, res) {
                user.notifyCarliOfNewLibraryUser(req.body.user, req.body.library)
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
        }
        function defineRoutesForExports() {
            authorizedRoute('get', '/pdf/content/:notificationId', carliAuth.requireStaffOrLibrary, function (req, res) {
                pdf.contentForPdf(req.params.notificationId)
                    .then(function (pdfContent) {
                        res.send(pdfContent.html);
                    })
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/pdf/export/:notificationId', carliAuth.requireStaffOrLibrary, function (req, res) {
                pdf.exportPdf(req.params.notificationId)
                    .then(function (exportResults) {
                        res.setHeader('Content-Disposition', 'attachment; filename="' + exportResults.fileName + '"');
                        res.send(exportResults.pdf);
                    })
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/csv/data/:notificationId', carliAuth.requireStaff, function (req, res) {
                vendorReportCsv.contentForVendorReport(req.params.notificationId)
                    .then(function (dataForReport) {
                        res.send(dataForReport);
                    })
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/csv/export/:notificationId', carliAuth.requireStaff, function (req, res) {
                vendorReportCsv.exportCsvForVendorReport(req.params.notificationId)
                    .then(function (exportResults) {
                        res.setHeader('Content-Disposition', 'attachment; filename="' + exportResults.fileName + '"');
                        res.type('csv');
                        res.send(exportResults.csv);
                    })
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/csv/export/pricing-template/:cycleId/:vendorId', carliAuth.requireStaff, function (req, res) {
                vendorPricingCsv.exportTemplateForVendorPricingCsv(req.params.cycleId, req.params.vendorId)
                    .then(function (exportResults) {
                            res.setHeader('Content-Disposition', 'attachment; filename="' + exportResults.fileName + '"');
                        res.type('csv');
                        res.send(exportResults.csv);
                    });
            });
            authorizedRoute('post', '/csv/import/pricing', carliAuth.requireStaff, function (req, res) {
                // var pathToTempFile = fs.write(req.body);
                Logger.log('writing temp file for import worker');
                var pathToTempFile = tmp.tmpNameSync();
                fs.writeFileSync(pathToTempFile, req.body.join("\n"), 'utf-8');

                cluster.worker.send({
                    command: 'launchPricingImportWorker',
                    pathToTempFile: pathToTempFile
                });
                sendOk(res)();
            });
        }
        function defineRoutesForInvoices() {
            authorizedRoute('get', '/next-batch-id', carliAuth.requireStaff, function (req, res) {
                pdf.generateNextBatchId()
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/next-invoice-number', carliAuth.requireStaff, function (req, res) {
                pdf.generateNextInvoiceNumber()
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
        }
        function defineRoutesForNotifications() {
            authorizedRoute('post', '/send-notification-email/:notificationId', carliAuth.requireStaff, function (req, res) {
                carliAuth.requireStaff()
                    .then(function () {
                        return email.sendNotificationEmail(req.params.notificationId);
                    })
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/notify-carli-of-one-time-purchase/:offeringId', carliAuth.requireSession, function (req, res) {
                carliAuth.requireSession()
                    .then(function () {
                        return email.sendOneTimePurchaseMessage(req.params.offeringId);
                    })
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/notify-carli-of-ip-address-change/:libraryId', carliAuth.requireSession, function (req, res) {
                carliAuth.requireSession()
                    .then(function () {
                        return email.sendIpAddressChangeNotification(req.params.libraryId);
                    })
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/notify-carli-of-vendor-done-entering-pricing/:vendorId', carliAuth.requireSession, function (req, res) {
                carliAuth.requireSession()
                    .then(function () {
                        return email.sendVendorDoneEnteringPricingMessage(req.params.vendorId);
                    })
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
            authorizedRoute('post', '/ask-carli', carliAuth.requireSession, function (req, res) {
                carliAuth.requireSession()
                    .then(function () {
                        return email.sendAskCarliMessage(req.body);
                    })
                    .then(sendOk(res))
                    .catch(sendError(res));
            });
        }
        function defineRoutesForReports() {
            authorizedRoute('get', '/reports/all-pricing/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.allPricingReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/selected-products/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.selectedProductsReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/contacts/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.contactsReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/statistics/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.statisticsReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/selections-by-vendor/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.selectionsByVendorReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/totals/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.totalsReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/list-products-for-vendor/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.listProductsForVendorReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/contracts/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.contractsReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/product-names/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.productNamesReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            authorizedRoute('get', '/reports/list-libraries/:parameters/:columns', carliAuth.requireStaff, function (req, res) {
                reports.listLibrariesReport(req.params.parameters, req.params.columns)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
        }
        function defineRoutesForTheDrupalSite() {
            carliMiddleware.get('/public/list-all-products', function (req, res) {
                publicApi.listProductsWithTermsForPublicWebsite()
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });
            carliMiddleware.get('/public/list-subscriptions-for-library/:libraryId', function (req, res) {
                publicApi.listSubscriptionsForLibrary(req.params.libraryId)
                    .then(sendJsonResult(res))
                    .then(sendError(res));
            });
            carliMiddleware.get('/public/list-subscriptions-for-library/:libraryId/for-cycle-name/:cycleName', function (req, res) {
                publicApi.listSubscriptionsForLibraryForCycleName(req.params.libraryId, req.params.cycleName)
                    .then(sendJsonResult(res))
                    .then(sendError(res));
            });
        }
        function defineRoutesForRestrictedApi() {
            authorizedRouteExpectingBasicAuth('get', '/restricted/v1', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                var docs = {
                    "/restricted/v1/list-libraries": "result is an array of libraries",
                    "/restricted/v1/list-library-users": "result is an array of users associated with a library",
                    "/restricted/v1/list-cycles": "result is an array of cycles",
                    "/restricted/v1/subscription-data/<cycle-id>": "result is array of selected offerings",
                };
                return Q.when(docs).then(sendJsonResult(res));
            });

            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/list-libraries.csv', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.listLibraries()
                    .then(convertArrayOfHomogeneousObjectToCsv)
                    .then(sendCsvResult(res))
                    .catch(sendError(res));
            });
            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/list-libraries', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.listLibraries()
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });

            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/list-library-users.csv', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.listLibraryUsers()
                    .then(convertArrayOfHomogeneousObjectToCsv)
                    .then(sendCsvResult(res))
                    .catch(sendError(res));
            });
            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/list-library-users', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.listLibraryUsers()
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });

            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/list-cycles.csv', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.listCycles()
                    .then(convertArrayOfHomogeneousObjectToCsv)
                    .then(sendCsvResult(res))
                    .catch(sendError(res));
            });
            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/list-cycles', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.listCycles()
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });

            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/subscription-data/:cycle.csv', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.getSubscriptionData(req.params.cycle)
                    .then(convertArrayOfHomogeneousObjectToCsv)
                    .then(sendCsvResult(res))
                    .catch(sendError(res));
            });
            authorizedRouteExpectingBasicAuth('get', '/restricted/v1/subscription-data/:cycle', carliAuth.requireBasicAuthForRestrictedApiV1, function (req, res) {
                return restrictedApi.getSubscriptionData(req.params.cycle)
                    .then(sendJsonResult(res))
                    .catch(sendError(res));
            });

            function convertArrayOfHomogeneousObjectToCsv(listOfObjects) {
                throwIfEmpty();
                throwIfNotHomogeneous();

                const twoDArray = make2DArrayFromJson(listOfObjects);
                return convert2dArrayToCsv(twoDArray);

                function throwIfEmpty() {
                    if (listOfObjects.length === 0)
                        throw new Error('No data found');
                }
                function throwIfNotHomogeneous() {
                    const headers = Object.keys(listOfObjects[0]);
                    listOfObjects.forEach(function(result) {
                        if (Object.keys(result).join(',') !== headers.join(','))
                            throwError();
                    });
                    function throwError() {
                        throw new Error('Non-homogeneous object found');
                    }
                }

                function convert2dArrayToCsv(table) {
                    return table.map(function(row) {
                        return row.map(quoteForCsv).join(',');
                    }).join("\n");
                }
            }

            function make2DArrayFromJson(listOfObjects) {
                const newArray = [
                    Object.keys(listOfObjects[0]),
                ];
                listOfObjects.forEach(function(obj) {
                    const row = Object.keys(obj).map(function(k) { return obj[k]; });
                    newArray.push(row);
                });

                return newArray;
            }

            function quoteForCsv(item) {
                if (!item)
                    return '';
                return item.toString().match(/[\s,"]/) ? '"' + item.replace(/"/g, '""') + '"' : item
            }
        }
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
function sendCsvResult(res) {
    return function (result) {
        res.type('text/csv').send(result);
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
        var errorToSend = err;
        if (err.statusCode) {
            errorCode = err.statusCode;
        }
        if (err.message){
            errorToSend = err.message;
        }
        res.status(errorCode).send( { error: errorToSend } );
        //res.status(errorCode).send( { error: errorToSend, stack: err.stack } ); //really useful for debugging
    }
}

function sendBasicAuthRequired(res) {
    res.header("WWW-Authenticate", "Basic");
    res.status(401).send( { error: "Unauthorized" } );
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

function handleCsvUploads() {
    var csvOptions = {};
    var csvBodyParserOptions = {limit: '50mb'};
    var csvMiddleware = expressCsv(csvBodyParserOptions, csvOptions);

    return function (req, res, next) {
        if (req.headers['content-type'] === 'text/csv') {
            return csvMiddleware(req, res, next);
        }
        next();
    }
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
