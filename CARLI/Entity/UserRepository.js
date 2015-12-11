var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , couchUtils = require('../Store/CouchDb/Utils')()
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , Q = require('q')
    , uuid = require('node-uuid')
    , crypto = require('crypto')
    , shasum = crypto.createHash('sha1');
    ;

var UserRepository = Entity('user');
var userStoreOptions = {
    privilegedCouchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbName: '_users'
};
UserRepository.setStore( Store( StoreModule(userStoreOptions) ) );

var propertiesToTransform = [];

function transformFunction( user ){
    EntityTransform.transformObjectForPersistence(user, propertiesToTransform);
}

function userId(user) {
    return 'org.couchdb.user:' + user.email;
}

function createUser( user ){
    if (user) {
        user.id = userId(user);
        user.name = user.email;
    }
    return UserRepository.create( user, transformFunction );
}

function updateUser( user ){
    user.id = userId(user);
    return UserRepository.update( user, transformFunction );
}

function listUsers(){
    return EntityTransform.expandListOfObjectsFromPersistence( UserRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadUser( userId ){
    var deferred = Q.defer();

    var id = normalizeUserId(userId);

    UserRepository.load( id )
        .then(function (user) {
            EntityTransform.expandObjectFromPersistence( user, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(user);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(user);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;

    function normalizeUserId(userId) {
        if (userId.indexOf('org.couchdb.user:') !== 0) {
            return 'org.couchdb.user:' + userId;
        } else {
            return userId;
        }
    }
}

function deleteUser( user ){
    return UserRepository.delete(userId(user));
}

function setMasqueradingLibraryIdForUserId(roleId, userId) {
    return setMasqueradingIdForRole(roleId, userId, 'library');
}
function setMasqueradingVendorIdForUserId(roleId, userId) {
    return setMasqueradingIdForRole(roleId, userId, 'vendor');
}

function setMasqueradingIdForRole(roleId, userId, role) {
    console.log('Masquerading ' + userId + ' as ' + role + ' ' + roleId);
    return loadUser(userId)
        .then(setRoles)
        .then(updateUser);

    function setRoles(user) {
        user.roles = getOtherRoles(user).concat(getNewRoles());
        user[role] = roleId;
        return user;
    }

    function getNewRoles() {
        return [ role, role + '-' + roleId ];
    }

    function getOtherRoles(user) {
        return user.roles.filter(nonMatchingRoles);

        function nonMatchingRoles(r) {
            return r.indexOf(role) !== 0;
        }
    }
}

/* functions that get added as instance methods on loaded users */


var functionsToAdd = {
};

function setStore(store) {
    UserRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    setStore: setStore,
    create: createUser,
    update: updateUser,
    setMasqueradingLibraryIdForUserId: setMasqueradingLibraryIdForUserId,
    setMasqueradingVendorIdForUserId: setMasqueradingVendorIdForUserId,
    list: listUsers,
    load: loadUser,
    delete: deleteUser
};
