
var auth = require('../../CARLI/Auth');
var config = require( '../../config' );
var StoreOptions = config.storeOptions;
var Store = require( '../../CARLI/Store' );
var StoreModule = require( '../../CARLI/Store/CouchDb/Store');
var userRepository = require('../../CARLI/Entity/UserRepository');

useAdminCouchCredentials();

function useAdminCouchCredentials() {
    var privilegedStoreOptions = {
        couchDbUrl: StoreOptions.privilegedCouchDbUrl,
        couchDbName: '_users'
    };
    userRepository.setStore(Store(StoreModule(privilegedStoreOptions)));
}

function list() {
    return userRepository.list();
}
function load(email) {
    return userRepository.load(email);
}
function create(user) {
    return auth.requireStaff().then(function() {
        return userRepository.create(user);
    });
}
function update(user) {
    return auth.requireStaff().then(function() {
        return userRepository.update(user);
    });
}

module.exports = {
    list: list,
    load: load,
    create: create,
    update: update
};
