
var config = require('../config');
var couchUtils = require('./Store/CouchDb/Utils');

function logIn(user) {
    return couchUtils.couchRequest({
        url: config.storeOptions.couchDbUrl + '/_session',
        body: 'username=' + user.username + '&password=' + user.password,
        method: 'post'
    }).then(function(session) {
        console.log(session);
        return session;
    });
}

module.exports = {
    logIn: logIn
};
