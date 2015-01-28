var config = require('../config');
var CycleRepository = require('../CARLI/Entity/CycleRepository');
var couchapp = require('couchapp');
var fs = require('fs');
var middleware = require('../config/environmentDependentModules').middleware;
var request = require('../config/environmentDependentModules').request;
var Q = require('q');

var projectRoot = __dirname + '/..';

function getDbUrl(dbName) {
    return config.storeOptions.couchDbUrl + '/' + dbName;
}

function makePromise(fun) {
    var deferred = Q.defer();
    fun(deferred);
    return deferred.promise;
}

function recreateDb(dbName) {
    var dbUrl = getDbUrl(dbName);

    return makePromise(function(deferred) {
        request.del(dbUrl, function () {
            request.put(dbUrl, function () {
                console.log("Created database " + dbName);
                deferred.resolve();
            });
        });
    });
}

function deployDb(dbName) {
    if (!dbName) {
        dbName = config.storeOptions.couchDbName;
    }
    return recreateDb(dbName).then(middleware.putDesignDoc(dbName));
}

function createOneTimePurchaseCycle(cycleName, store) {
    var otpCycle = require(projectRoot + '/db/oneTimePurchaseCycle.json');
    if (cycleName) {
        otpCycle.name = cycleName;
    }
    if (store) {
        CycleRepository.setStore(store);
    }

    return CycleRepository.create(otpCycle);
}

if (require.main === module) {
    // called directly
    deployDb().done(createOneTimePurchaseCycle);
} else {
    // required as a module
    module.exports = {
        deployDb: deployDb,
        createOneTimePurchaseCycle: createOneTimePurchaseCycle
    };
}
