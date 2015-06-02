
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils')();

function createSession(userLogin) {
    return couchUtils.couchRequestSession(userLogin);
}

function deleteSession() {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_session', method: 'delete' });
}

function getSession() {
    console.log('getting session', config.storeOptions.couchDbUrl);
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_session', method: 'get' }).then(returnUserContext);

    function returnUserContext(response) {
        console.log('response', response);
        return response.userCtx;
    }
}

function getUser(email) {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_users/org.couchdb.user:' + email, method: 'get' });
}

function requireStaff() {
    return getSession().then(function (userContext) {
        console.log(userContext);
        if (userContext.roles.indexOf('staff') >= 0 || userContext.roles.indexOf('_admin') >= 0) {
            console.log('required staff success');
            return true;
        }
        console.log('required staff fail');
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
