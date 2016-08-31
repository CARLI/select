var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , carliError = require('../Error')
    , config = require( '../../config' )
    , couchUtils = require('../Store/CouchDb/Utils')()
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , UserRepository = require('./UserRepository')
    , Q = require('q')
    , uuid = require('node-uuid')
;

var email = require('../../config/environmentDependentModules/email');
var request = require('../../config/environmentDependentModules/request');


var UserResetRequestRepository = Entity('UserResetRequest');
var userResetRequestStoreOptions = {
    privilegedCouchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbName: 'user-reset-requests'
};
UserResetRequestRepository.setStore( Store( StoreModule(userResetRequestStoreOptions) ) );

function createRequest( userEmail, baseUrl ){
    var resetRequest = {
        email: userEmail,
        key: generateNonce(),
        date: new Date().toISOString()
    };

    var user = null;

    return requireUserExists()
        .then(saveLocalUserReference)
        .then(createResetRequest)
        .then(deleteExpiredResetRequests)
        .then(returnOk);

    function requireUserExists() {
        return UserRepository.load(userEmail);
    }

    function saveLocalUserReference(u) {
        user = u;
    }

    function createResetRequest() {
        return UserResetRequestRepository.create(resetRequest)
            .then(UserResetRequestRepository.load)
            .then(sendResetInfoToUser);
    }

    function sendResetInfoToUser(resetRequest) {
        return getPasswordResetTemplate()
            .then(sendEmail);

        function sendEmail(template) {
            var variables = {
                user: user,
                resetLink: baseUrl + '/reset/' + resetRequest.key
            };
            return email.sendPasswordResetMessage(resetRequest.email, template, variables);
        }
    }

    function getPasswordResetTemplate() {
        var template = "Hi {{ user.fullName }},\n\n" +
            "An account for CARLI's e-resource pricing and selection system has been created for you.\n" +
            "Your username is: {{ user.email }}\n" +
            "Set your password here: {{ resetLink }}\n" +
            "Please contact CARLI if you have any questions or need assistance: support@carli.illinois.edu";

        return Q(template);
    }

    function returnOk() {
        return { ok: true };
    }

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
}

function deleteRequest( requestId ){
    return UserResetRequestRepository.delete( requestId );
}

function throwInvalidKey() {
    throw carliError('Request has expired', 500);
}

function isKeyValid(key) {
    return getRequestByResetKey(key)
        .catch(throwInvalidKey)
        .then(isRequestValid);
}

function consumeKey(key) {
    return getRequestByResetKey(key)
        .then(returnId)
        .then(deleteRequest);

    function returnId(request) {
        return request.id;
    }
}

function getRequestByResetKey(key) {
    return couchUtils.getCouchViewResultValues( 'user-reset-requests', 'listRequestsByResetKey', key)
        .then(function(results) {
            return results[0] || throwInvalidKey();
        });
}

function isRequestValid(request) {
    var oneDayInMilliseconds = 86400000;
    var millisecondsSinceKeyWasGenerated = Date.now() - new Date(request.date).getTime();

    if (millisecondsSinceKeyWasGenerated > oneDayInMilliseconds) {
        throwInvalidKey();
    }
    return request;
}

function deleteExpiredResetRequests() {
    return couchUtils.getCouchViewResultObject( 'user-reset-requests', 'listExpiredRequestIds')
        .then(function(results) {
            return Q.all(Object.keys(results).map(deleteRequest));
        });
}

function setStore(store) {
    UserResetRequestRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
}

function notifyCarliOfNewLibraryUser(user, library) {
    return getNewUserNotificationTemplate()
        .then(sendEmail);

    function sendEmail(template) {
        var variables = {
            user: user,
            library: library
        };
        return email.notifyCarliOfNewLibraryUser(template, variables);
    }
}

function getNewUserNotificationTemplate() {
    var template = "A new user has been created for {{ library.name }}\n\n" +
        "Name: {{ user.fullName }},\n" +
        "Username: {{ user.email }}\n" +
        "";
    return Q(template);
}

module.exports = {
    setStore: setStore,
    create: createRequest,
    isKeyValid: isKeyValid,
    consumeKey: consumeKey,
    notifyCarliOfNewLibraryUser: notifyCarliOfNewLibraryUser
};
