
var auth = require('./Auth');
var config = require('../config');

function asCouchAdmin(doSomething) {
    return loginToCouch()
        .then(doSomething)
        .finally(logoutOfCouch);
}

function loginToCouch() {
    return auth.createSession({
        email: config.storeOptions.privilegedCouchUsername,
        password: config.storeOptions.privilegedCouchPassword
    });
}

function logoutOfCouch() {
    return auth.deleteSession().then(function (r) {
        return r;
    });
}

module.exports = {
    asCouchAdmin
};
