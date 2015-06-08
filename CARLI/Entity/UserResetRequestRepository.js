var Entity = require('../Entity')
    , EntityTransform = require( './EntityTransformationUtils')
    , config = require( '../../config' )
    , couchUtils = require('../Store/CouchDb/Utils')()
    , StoreOptions = config.storeOptions
    , Store = require( '../Store' )
    , StoreModule = require( '../Store/CouchDb/Store')
    , Q = require('q')
    , uuid = require('node-uuid')
;

var UserResetRequestRepository = Entity('userResetRequest');
var userResetRequestStoreOptions = {
    privilegedCouchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbUrl: StoreOptions.privilegedCouchDbUrl,
    couchDbName: 'user-reset-requests'
};
UserResetRequestRepository.setStore( Store( StoreModule(userResetRequestStoreOptions) ) );

function createRequest( email ){
    var resetRequest = {
        email: email,
        key: generateNonce(),
        date: new Date().toISOString()
    };

    return deleteExpiredResetRequests().then(function() {
        return UserResetRequestRepository.create( resetRequest, function() {} );
    });

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

function isKeyValid(key) {
    return getRequestByResetKey(key)
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
    return couchUtils.getCouchViewResultValues( 'user-reset-requests', 'listRequestsByResetKey', key);
}

function isRequestValid(request) {
    var oneDayInMilliseconds = 86400000;
    var millisecondsSinceKeyWasGenerated = Date.now() - new Date(request.date).getTime();

    if (millisecondsSinceKeyWasGenerated > oneDayInMilliseconds) {
        throw new Error('Request has expired');
    }
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

module.exports = {
    setStore: setStore,
    create: createRequest,
    isKeyValid: isKeyValid,
    consumeKey: consumeKey
};
