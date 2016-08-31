
var auth = require('../../CARLI/Auth');
var config = require( '../../config' );
var StoreOptions = config.storeOptions;
var Store = require( '../../CARLI/Store' );
var StoreModule = require( '../../CARLI/Store/CouchDb/Store');
var userRepository = require('../../CARLI/Entity/UserRepository');
var userResetRequestRepository = require('../../CARLI/Entity/UserResetRequestRepository');

useAdminCouchCredentials();

function useAdminCouchCredentials() {
    var userStoreOptions = {
        couchDbUrl: StoreOptions.privilegedCouchDbUrl,
        couchDbName: '_users'
    };
    userRepository.setStore(Store(StoreModule(userStoreOptions)));
    var resetStoreOptions = {
        couchDbUrl: StoreOptions.privilegedCouchDbUrl,
        couchDbName: 'user-reset-requests'
    };
    userResetRequestRepository.setStore(Store(StoreModule(resetStoreOptions)));
}

function list() {
    return userRepository.list();
}
function load(email) {
    return userRepository.load(email);
}
function create(user) {
    return userRepository.create(user);
}
function update(user) {
    return userRepository.update(user);
}

function deleteUser(user) {
    return auth.requireStaff().then(function() {
        return userRepository.delete(user);
    });
}

function requestPasswordReset(email, resetLinkBaseUrl) {
    return userResetRequestRepository.create(email, resetLinkBaseUrl);
}

function isKeyValid(key) {
    return userResetRequestRepository.isKeyValid(key);
}

function consumeKey(key, user) {
    return userResetRequestRepository.isKeyValid(key)
        .then(function() {
            return userRepository.update(user).then(function () {
                return userResetRequestRepository.consumeKey(key);
            });
        });
}

function notifyCarliOfNewLibraryUser(user, library) {
    return userResetRequestRepository.notifyCarliOfNewLibraryUser(user, library);
}

module.exports = {
    list: list,
    load: load,
    create: create,
    update: update,
    delete: deleteUser,
    requestPasswordReset: requestPasswordReset,
    isKeyValid: isKeyValid,
    consumeKey: consumeKey,
    notifyCarliOfNewLibraryUser: notifyCarliOfNewLibraryUser
};
