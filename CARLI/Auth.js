
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils');

var session = null;

function logIn(user) {
    console.log('Logging in with ', user);
    return couchUtils.couchRequest({
        url: config.storeOptions.couchDbUrl + '/_session',
        method: 'post',
        json: {
            name: user.email,
            password: user.password
        }
    }).then(function(response) {
        if (response.ok) {
            return getUser(user.email);
        }
        throw new Error(response.reason);
    });
i
    // This works with node request, but not browser-request:
    //return couchUtils.couchRequest({
    //    url: config.storeOptions.couchDbUrl + '/_session',
    //    method: 'post',
    //    form: {
    //        name: user.email,
    //        password: user.password
    //    }
    //}).then(function(newSession) {
    //    session = newSession;
    //    return session;
    //});
}

function getUser(email) {
    return couchUtils.couchRequest({ url: config.storeOptions.couchDbUrl + '/_users/org.couchdb.user:' + email, method: 'get' });
}

module.exports = {
    logIn: logIn,
    getUser: getUser
};
