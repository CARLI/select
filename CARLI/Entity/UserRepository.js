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

/* functions that get added as instance methods on loaded users */


var functionsToAdd = {
};

function setStore(store) {
    UserRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
    EntityTransform.setEntityLookupStores(store);
}

module.exports = {
    setStore: setStore,
    create: createUser,
    update: updateUser,
    list: listUsers,
    load: loadUser
};
