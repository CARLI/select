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

function recreateDb(dbName) {
    var deferred = Q.defer();
    var dbUrl = getDbUrl(dbName);

    request.del(dbUrl, function () {
        request.put(dbUrl, function (err) {
            if (err) {
                console.log("Error creating database '"+dbName+"':" + err);
                deferred.reject(err);
            } else {
                console.log("Created database " + dbName);
                deferred.resolve();
            }
        });
    });
    return deferred.promise;
}

function deployDb(dbName) {
    if (!dbName) {
        dbName = config.storeOptions.couchDbName;
    }
    return recreateDb(dbName).then(function() {
        return middleware.putDesignDoc(dbName, 'CARLI');
    });
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
