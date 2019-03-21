
var auth = require('../../CARLI/Auth');
var config = require( '../../config' );
var request = require('../../config/environmentDependentModules/request');
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
    request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
    return userRepository.list();
}
function load(email) {
    request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
    return userRepository.load(email);
}
function create(user) {
    request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
    return userRepository.create(user);
}
function update(user) {
    request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
    return userRepository.update(user);
}

function deleteUser(user) {
    return auth.requireStaff().then(function() {
        request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
        return userRepository.delete(user);
    });
}

function requestPasswordReset(email, resetLinkBaseUrl) {
    // request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
    return userResetRequestRepository.create(email, resetLinkBaseUrl);
}

function isKeyValid(key) {
    // request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
    return userResetRequestRepository.isKeyValid(key);
}

function consumeKey(key, user) {
    // request.giveUpCookieAuthToAllowPrivilegedUrlAuthWorkaround();
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
