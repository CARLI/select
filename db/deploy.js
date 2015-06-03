var config = require('../config');
var CycleRepository = require('../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../CARLI/Entity/CycleRepositoryForVendor');
var couchApp = require('../middleware/components/couchApp');
var request = require('request');
var Q = require('q');
var dbInfo = require('./databaseInfo');
var vendorRepository = require('../CARLI/Entity/VendorRepository');


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
        return couchApp.putDesignDoc(dbName, 'CARLI');
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

function deployLocalAppDesignDoc() {
    return deployAppDesignDoc(dbInfo.local);
}

function deployAppDesignDoc(instance) {
    return couchApp.putDesignDoc(instance.mainDbName, 'CARLI');
}

function deployLocalCycleDesignDocs() {
    return CycleRepository.list().then(function (cycles) {
        var promises = [];
        cycles.forEach(function (cycle) {
            promises.push( couchApp.putDesignDoc(cycle.getDatabaseName(), 'Cycle') );
            promises.push( deployLocalCycleDesignDocsForVendorDatabases(cycle ) );
        });
        return Q.all(promises);
    });
}

function deployLocalCycleDesignDocsForVendorDatabases( cycle ) {
    return vendorRepository.list()
        .then(function (vendors) {
            return Q.all( vendors.map(pushDesignDocForVendor) );
        });

        function pushDesignDocForVendor(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.load(cycle.id)
                .then(function(cycleForVendor){
                    return couchApp.putDesignDoc( cycleForVendor.getDatabaseName(), 'Cycle' )
                        .catch(function(err){
                            console.log('error deploying '+vendor.id+' design doc: ',err);
                        });
                })
        }
}

if (require.main === module) {
    // called directly
    deployDb().done(createOneTimePurchaseCycle);
} else {
    // required as a module
    module.exports = {
        deployDb: deployDb,
        createOneTimePurchaseCycle: createOneTimePurchaseCycle,
        deployLocalAppDesignDoc: deployLocalAppDesignDoc,
        deployLocalCycleDesignDocs: deployLocalCycleDesignDocs
    };
}
