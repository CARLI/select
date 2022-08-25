var Q = require('q');
var request = require('request');
var _ = require('lodash');
var util = require('util');

var carliError = require('../CARLI/Error');
var config = require('../config');
var couchApp = require('../middleware/components/couchApp');
var cycleRepository = require('../CARLI/Entity/CycleRepository');
var cycleRepositoryForVendor = require('../CARLI/Entity/CycleRepositoryForVendor');
var userRepository = require('../CARLI/Entity/UserRepository');
var vendorRepository = require('../CARLI/Entity/VendorRepository');
var storeOptions = config.storeOptions;
var unprivilegedCouchDbUrl = storeOptions.couchDbUrl;
storeOptions.couchDbUrl = storeOptions.privilegedCouchDbUrl;
var Store = require('../CARLI/Store');
var StoreModule = require('../CARLI/Store/CouchDb/Store');

cycleRepository.setStore(getPrivilegedStore());
vendorRepository.setStore(getPrivilegedStore());

var projectRoot = __dirname + '/..';

var activityLogDbName = 'activity-log';

function getDbUrl(dbName) {
    return config.storeOptions.privilegedCouchDbUrl + '/' + dbName;
}

function getPrivilegedStore() {
    return Store( StoreModule(storeOptions) );
}

function recreateDb(dbName) {
    var deferred = Q.defer();
    var dbUrl = getDbUrl(dbName);

    request.del(dbUrl, function () {
        request.put(dbUrl, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                Logger.log("Created database " + dbName);
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
        .then(addDesignDoc)
        .then(deployResetRequestDb);

    function addSecurityDoc() {
        addSecurityDocWithRoles(dbName, [ '_admin', 'staff', 'vendor', 'library' ]);
    }
    function addDesignDoc() {
        return couchApp.putDesignDoc(dbName, 'CARLI');
    }
}

function deployResetRequestDb() {
    var dbName = 'user-reset-requests';

    return recreateDb(dbName)
        .then(addResetSecurityDoc)
        .then(addResetDesignDoc);

    function addResetSecurityDoc() {
        return addSecurityDocAdminOnly(dbName);
    }
    function addResetDesignDoc() {
        return couchApp.putDesignDoc(dbName, 'UserResetRequest');
    }
}

function deployActivityLogDb(){
    return recreateDb(activityLogDbName)
        .then(deployDesignDocToActivityLog)
}

function createAdminUser() {
    var deferred = Q.defer();

    request.put({
        url: unprivilegedCouchDbUrl + '/_config/admins/' + config.storeOptions.privilegedCouchUsername,
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
            Logger.log('Error creating admin user', carliError(data, response.statusCode));
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
            Logger.log(err);
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

async function addRoleToSecurityDoc(dbName, role) {
    const asyncGet = util.promisify(request.get);
    const response = await asyncGet({
        url: getDbUrl(dbName) + '/_security'
    });

    const body = JSON.parse(response.body);
    if(!body.members) {
        console.log("O M G", dbName);
        return;
    }
    const roles = body.members && body.members.roles ? body.members.roles : [];
    if(roles.indexOf(role) === -1) {
        roles.push(role);
        await asyncAddSecurityDocWithRoles(dbName, roles);
    }
}

function asyncAddSecurityDocWithRoles(dbName, roles) {
    const asyncPut = util.promisify(request.put);
    return asyncPut({
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

function addSecurityDocAdminOnly(dbName) {
    return addSecurityDocWithRoles(dbName, [ '_admin' ]);
}

function deployLocalAppDesignDoc() {
    throw new Error("missing local db info");
}

function deployAppDesignDoc(instance) {
    return couchApp.putDesignDoc(instance.mainDbName, 'CARLI')
        .then(deployDesignDocToUsers)
        .then(deployDesignDocToResetRequest);

    function deployDesignDocToUsers() {
        return couchApp.putDesignDoc('_users', 'Users');
    }
    function deployDesignDocToResetRequest() {
        return couchApp.putDesignDoc('user-reset-requests', 'UserResetRequest');
    }
}

function deployDesignDocToActivityLog(){
    return couchApp.putDesignDoc(activityLogDbName, 'ActivityLog')
}

function deployLocalCycleDesignDocs() {
    return cycleRepository.list().then(function (cycles) {
        var promises = [];
        cycles.forEach(function (cycle) {
            promises.push( couchApp.putDesignDoc(cycle.getDatabaseName(), 'Cycle') );
            promises.push( deployLocalCycleDesignDocsForVendorDatabases(cycle ) );
        });
        return Q.all(promises);
    })
        .catch(function (err) { Logger.log('>>> Not allowed to list cycles', err); });
}

function deployLocalCycleDesignDocsForVendorDatabases( cycle ) {
    return vendorRepository.list()
        .then(function (vendors) {
            return Q.all( vendors.map(pushDesignDocForVendor) );
        });

        function pushDesignDocForVendor(vendor) {
            var repoForVendor = cycleRepositoryForVendor(vendor);
            return repoForVendor.load(cycle.id)
                .then(putDesignDocIfCycleExists);

            function putDesignDocIfCycleExists(cycleForVendor){
                return cycleForVendor.databaseExists().then(function (exists) {
                    if (!exists) {
                        return Q();
                    }

                    return couchApp.putDesignDoc( cycleForVendor.getDatabaseName(), 'Cycle' )
                        .catch(function(err){
                            Logger.log('error deploying '+vendor.id+' design doc: ',err);
                        });
                });
            }
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
        deployResetRequestDb: deployResetRequestDb,
        deployLocalAppDesignDoc: deployLocalAppDesignDoc,
        deployLocalCycleDesignDocs: deployLocalCycleDesignDocs,
        deployDesignDocToActivityLog: deployDesignDocToActivityLog,
        deployActivityLogDb: deployActivityLogDb,
        addRoleToSecurityDoc: addRoleToSecurityDoc
    };
}
