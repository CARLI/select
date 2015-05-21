
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils');

function createSession(userLogin) {
    return couchUtils.couchRequestSession(userLogin);
}

function deleteSession() {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_session', method: 'delete' });
}

function getSession() {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_session', method: 'get' }).then(returnUserContext);

    function returnUserContext(response) {
        return response.userCtx;
    }
}

function getUser(email) {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_users/org.couchdb.user:' + email, method: 'get' });
}

module.exports = {
    createSession: createSession,
    deleteSession: deleteSession,
    getSession: getSession,
    getUser: getUser
};
