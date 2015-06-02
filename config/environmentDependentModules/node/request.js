var config = require('../../../config');
var request = require('request');

var jar = request.jar();
request = request.defaults({jar: jar});

request.setAuth = function (authSession) {
    jar.setCookie('AuthSession='+authSession, config.storeOptions.couchDbUrl);
};
request.clearAuth = function () {
    jar.setCookie('AuthSession=', config.storeOptions.couchDbUrl);
};
request.getJar = function() {
    return jar;
};

module.exports = request;
