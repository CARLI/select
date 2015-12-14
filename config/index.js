var _ = require('lodash');
var defaults = require('./defaults');
var local = require('./local');
var secure = {};
var secureConfigPath = null;

var config = loadConfiguration();
makeLoggerGlobal();

var storeOptionsForCycles = null;

function loadConfiguration() {
    var config = {};

    concealSecureConfigFromBrowserify();

    config = _.merge(defaults, secure, local);

    setMiddlewareUrl();
    setCouchDbUrl();
    setPrivilegedCouchDbUrl();
    setWebAppUrls();

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

    function setWebAppUrls() {
        if (isBrowserEnvironment()) {
            if (window.location.hostname === 'carli-staff.qa.pixotech.com') {
                config.staffWebAppUrl = "http://carli-staff.qa.pixotech.com";
                config.libraryWebAppUrl = "http://carli-library.qa.pixotech.com";
                config.vendorWebAppUrl = "http://carli-vendor.qa.pixotech.com";
            }
            if (window.location.hostname === 'select-staff.carli.illinois.edu') {
                config.staffWebAppUrl = "http://select-staff.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor.carli.illinois.edu";
            }
        }
    }
}

function makeLoggerGlobal() {
    var Logger = require('../CARLI/Logger');

    if (isBrowserEnvironment()) {
        window.Logger = Logger;
    } else {
        global.Logger = Logger;
    }
}

function isSecureEnvironment() {
    return !isBrowserEnvironment();
}

function isBrowserEnvironment() {
    return (typeof window !== 'undefined');
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
config.getAuthTimeoutDuration = function() {
    return config.authMillisecondsUntilWarningAppears + config.authWarningDurationInMilliseconds;
};

module.exports = config;
