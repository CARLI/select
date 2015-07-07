var _ = require('lodash');
var defaults = require('./defaults');
var local = require('./local');
var secure = {};
var secureConfigPath = null;

var config = loadConfiguration();

var storeOptionsForCycles = null;

function loadConfiguration() {
    var config = {};

    concealSecureConfigFromBrowserify();

    config = _.merge(defaults, secure, local);

    setMiddlewareUrl();
    setCouchDbUrl();
    setPrivilegedCouchDbUrl();

    return config;

    function concealSecureConfigFromBrowserify() {
        if (isSecureEnvironment()) {
            secureConfigPath = './secure';
        }

        if (secureConfigPath) {
            secure = require(secureConfigPath);
        }
    }

    function setMiddlewareUrl() {
        if (isBrowserEnvironment()) {
            var l = window.location;
            config.middleware.url = l.protocol + '//' + l.host + '/api';
        }
    }

    function setCouchDbUrl() {
        if (isBrowserEnvironment()) {
            setCouchDbUrlForBrowser();
        } else {
            setCouchDbUrlForMiddleware();
        }

        function setCouchDbUrlForBrowser() {
            var l = window.location;
            config.storeOptions.couchDbUrl = l.protocol + '//' + l.host + '/db';
        }

        function setCouchDbUrlForMiddleware() {
            if (process.env.hasOwnProperty('CARLI_COUCHDB_PORT_5984_TCP_ADDR')) {
                var host = process.env.CARLI_COUCHDB_PORT_5984_TCP_ADDR;
                var port = process.env.CARLI_COUCHDB_PORT_5984_TCP_PORT;
                config.storeOptions.couchDbUrl = 'http://' + host + ':' + port;
                config.storeOptions.privilegedCouchHostname = host + ':' + port;
            }
        }
    }

    function setPrivilegedCouchDbUrl() {
        if (isSecureEnvironment() && !config.storeOptions.privilegedCouchDbUrl) {
            config.storeOptions.privilegedCouchDbUrl = config.storeOptions.privilegedCouchUrlScheme +
                config.storeOptions.privilegedCouchUsername + ':' +
                config.storeOptions.privilegedCouchPassword + '@' +
                config.storeOptions.privilegedCouchHostname;
        }
    }

    function isSecureEnvironment() {
        return !isBrowserEnvironment();
    }

    function isBrowserEnvironment() {
        return (typeof window !== 'undefined');
    }
}

config.setDbName = function(name) {
    config.storeOptions.couchDbName = name;
};
config.getDbName = function() {
    return config.storeOptions.couchDbName;
};
config.getMiddlewareUrl = function() {
    return config.middleware.url;
};
config.setStoreOptionsForCycles = function(storeOptions){
    storeOptionsForCycles = storeOptions;
};
config.getStoreOptionsForCycles = function(){
    return storeOptionsForCycles || config.storeOptions;
};

module.exports = config;
