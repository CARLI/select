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

function createUser( user ){
    if (user) {
        user.id = 'org.couchdb.user:' + user.email;
        user.name = user.email;
    }
    return UserRepository.create( user, transformFunction );
}

function updateUser( user ){
    user.id = 'org.couchdb.user:' + user.email;
    return UserRepository.update( user, transformFunction );
}

function listUsers(){
    return EntityTransform.expandListOfObjectsFromPersistence( UserRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadUser( userId ){
    var deferred = Q.defer();

    UserRepository.load( 'org.couchdb.user:' + userId )
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
}

/* functions that get added as instance methods on loaded users */


var functionsToAdd = {
    generateUserHash: function generateUserHash() {
        var user = this;

        shasum.update(user.email);
        return shasum.digest('hex');
    },
    generatePasswordResetKey: function generatePasswordResetKey() {
        var user = this;

        // !!! TODO: we can't store this on user.  Anyone can load the user object and get them.
        user.passwordResetKey = generateNonce();
        user.passwordResetDate = new Date().toISOString();

        return UserRepository.update(user);
    },
    passwordResetKeyIsValid: function validatePasswordResetKey(userProvidedHash) {
        var user = this;

        if (!user.passwordResetKey || !user.passwordResetDate) {
            return false;
        }
        if (isKeyExpired()) {
            return false;
        }
        return userProvidedHash === user.generateUserHash();

        function isKeyExpired() {
            var oneDayInMilliseconds = 86400000;
            var keyGeneratedMilliseconds = new Date(user.passwordResetDate).getTime();

            return Date.now() - keyGeneratedMilliseconds > oneDayInMilliseconds;
        }
    },
    consumePasswordResetKey: function consumePasswordResetKey() {
        var user = this;

        delete user.passwordResetKey;
        delete user.passwordResetDate;

        return UserRepository.update(user);
    }
};

function generateNonce() {
    var nonce = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var length = 64;

    for (var i = 0; i < length; ++i) {
        var rnum = Math.floor(Math.random() * chars.length);
        nonce += chars.substring(rnum, rnum+1);
    }
    return nonce;
}

function requestPasswordReset(email) {
    return loadUser(email).then(generatePasswordResetKey);

    function generatePasswordResetKey(user) {
        return user.generatePasswordResetKey();
    }
}

function getUserByPasswordResetKey(key) {
    return couchUtils.getCouchViewResultValues( '_users', 'listUsersByEmail', key);
}


function setStore(store) {
    UserRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

module.exports = {
    setStore: setStore,
    create: createUser,
    update: updateUser,
    list: listUsers,
    load: loadUser,
    requestPasswordReset: requestPasswordReset
};
