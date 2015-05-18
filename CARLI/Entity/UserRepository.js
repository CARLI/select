var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , couchUtils = require('../Store/CouchDb/Utils')
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , Q = require('q')
    ;

var UserRepository = Entity('Vendor');
var userStoreOptions = {
    couchDbUrl: StoreOptions.couchDbUrl,
    couchDbName: '_users'
};
UserRepository.setStore( Store( StoreModule(userStoreOptions) ) );

var propertiesToTransform = [];

function transformFunction( vendor ){
    EntityTransform.transformObjectForPersistence(vendor, propertiesToTransform);
}

function createUser( vendor ){
    return UserRepository.create( vendor, transformFunction );
}

function updateUser( vendor ){
    return UserRepository.update( vendor, transformFunction );
}

function listUsers(){
    return EntityTransform.expandListOfObjectsFromPersistence( UserRepository.list(), propertiesToTransform, functionsToAdd);
}

function loadUser( vendorId ){
    var deferred = Q.defer();

    UserRepository.load( vendorId )
        .then(function (vendor) {
            EntityTransform.expandObjectFromPersistence( vendor, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(vendor);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    console.warn('*** Cannot find reference in database ', err);
                    deferred.resolve(vendor);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

/* functions that get added as instance methods on loaded Vendors */

var functionsToAdd = {
};

module.exports = {
    setStore: UserRepository.setStore,
    create: createUser,
    update: updateUser,
    list: listUsers,
    load: loadUser
};
