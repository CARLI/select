
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils')();

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

function requireStaff() {
    return getSession().then(function (userContext) {
        if (userContext.roles.indexOf('staff') >= 0) {
            return true;
        }
        throw new Error('Unauthorized');
    });
}

module.exports = {
    createSession: createSession,
    deleteSession: deleteSession,
    getSession: getSession,
    getUser: getUser,
    requireStaff: requireStaff
};
