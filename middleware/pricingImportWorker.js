
var cluster = require('cluster');
var fs = require('fs');

var auth = require('../CARLI/Auth');
var config = require('../config');
var vendorPricingCsv = require('./components/csv/vendorPricingCsv');

Logger.log('Pricing import worker started');

var pathToTempFile = process.env.pathToTempFile;
var rawContent = fs.readFileSync(pathToTempFile, 'utf-8');
//fs.unlinkSync(pathToTempFile);

asCouchAdmin(parseAndUploadRawContent)
    .catch(logError)
    .finally(exitWorker);

function asCouchAdmin(doSomething) {
    return loginToCouch()
        .then(doSomething)
        .finally(logoutOfCouch);
}

function parseAndUploadRawContent() {
    return vendorPricingCsv.parseCsvInput(rawContent).then(function (parsed) {
        Logger.log('Importing pricing for:');
        Logger.log('   Vendor = ' + parsed.metadata.vendorId);
        Logger.log('   Cycle  = ' + parsed.metadata.cycleId);
        Logger.log('** Launching a worker to import parsed CSV content');

        return vendorPricingCsv.importFromCsv(parsed.metadata.cycleId, parsed.metadata.vendorId, parsed.content);
    });
}

function loginToCouch() {
    return auth.createSession({
        email: config.storeOptions.privilegedCouchUsername,
        password: config.storeOptions.privilegedCouchPassword
    });
}

function logoutOfCouch() {
    return auth.deleteSession().then(function (r) {
        return r;
    });
}

function exitWorker() {
    cluster.worker.kill();
}

function logError(error) {
    Logger.log('Error processing pricing import');
    Logger.log(error);
    return error;
}
