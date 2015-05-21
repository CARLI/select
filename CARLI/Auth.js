
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils');

function logIn(user) {
    return couchUtils.couchRequestSession(user);
}

function getUser(email) {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_users/org.couchdb.user:' + email, method: 'get' });
}

module.exports = {
    logIn: logIn,
    getUser: getUser
};
