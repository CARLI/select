var Q = require('q');
var request = require('request');
var _ = require('lodash');

var carliError = require('../CARLI/Error');
var config = require('../config');
var couchApp = require('../middleware/components/couchApp');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../CARLI/Entity/CycleRepositoryForVendor');
var dbInfo = require('./databaseInfo');
var userRepository = require('../CARLI/Entity/UserRepository');
var vendorRepository = require('../CARLI/Entity/VendorRepository');

var projectRoot = __dirname + '/..';

function getDbUrl(dbName) {
    return config.storeOptions.privilegedCouchDbUrl + '/' + dbName;
}

function recreateDb(dbName) {
    var deferred = Q.defer();
    var dbUrl = getDbUrl(dbName);

    request.del(dbUrl, function () {
        request.put(dbUrl, function (err) {
            if (err) {
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
    return recreateDb(dbName)
        .then(addSecurityDoc)
        .then(addDesignDoc);

    function addSecurityDoc() {
        addSecurityDocWithRoles(dbName, [ 'staff', 'vendor', 'library' ]);
    }
    function addDesignDoc() {
        return couchApp.putDesignDoc(dbName, 'CARLI');
    }
}

function createAdminUser() {
    var deferred = Q.defer();

    request.put({
        url: config.storeOptions.couchDbUrl + '/_config/admins/' + config.storeOptions.privilegedCouchUsername,
        body: '"' + config.storeOptions.privilegedCouchPassword + '"'
    }, handleCouchResponse);

    function handleCouchResponse(error, response, body) {
        var data;

        if (error) {
            deferred.reject(carliError(error, response.statusCode));
        }
        else {
            data = (typeof body === 'string') ? JSON.parse(body) : body;
        }

        if (data && data.error) {
            console.log('Error creating admin user', carliError(data, response.statusCode));
            deferred.reject(carliError(data, response.statusCode));
        }
        else {
            deferred.resolve(data);
        }
    }
    return deferred.promise;
}

function createUsersFromJson(file) {
    var users = require(file);

    return Q.all(users.map(createUser))
        .catch(function(err) {
            console.log(err);
        });

    function createUser(user) {
        return userRepository
            .create(user)
            .catch(updateIfConflict);

        function updateIfConflict(err) {
            if (err.statusCode == 409) {
                return userRepository
                    .load(user.email)
                    .then(mergeAndUpdateUser);
            }
            throw err;
        }

        function mergeAndUpdateUser(loadedUser) {
            var updatedUser = _.extend(loadedUser, user);
            return userRepository.update(updatedUser);
        }
    }
}

function createOneTimePurchaseCycle(cycleName, store) {
    var otpCycle = require(projectRoot + '/db/oneTimePurchaseCycle.json');
    if (cycleName) {
        otpCycle.name = cycleName;
    }
    if (store) {
        cycleRepository.setStore(store);
    }

    return cycleRepository.create(otpCycle);
}

function addSecurityDocWithRoles(dbName, roles) {
    request.put({
        url: getDbUrl(dbName) + '/_security',
        json: {
            admins: {
                names: [],
                roles:[]
            },
            members: {
                names: [],
                roles: roles
            }
        }
    });
}

function deployLocalAppDesignDoc() {
    return deployAppDesignDoc(dbInfo.local);
}

function deployAppDesignDoc(instance) {
    return couchApp.putDesignDoc(instance.mainDbName, 'CARLI')
        .then(deployDesignDocToUsers);

    function deployDesignDocToUsers() {
        return couchApp.putDesignDoc('_users', 'CARLI');
    }
}

function deployLocalCycleDesignDocs() {
    return cycleRepository.list().then(function (cycles) {
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
        createAdminUser: createAdminUser,
        createUsersFromJson: createUsersFromJson,
        createOneTimePurchaseCycle: createOneTimePurchaseCycle,
        deployLocalAppDesignDoc: deployLocalAppDesignDoc,
        deployLocalCycleDesignDocs: deployLocalCycleDesignDocs
    };
}
