var _ = require('lodash');
var defaults = require('./defaults');
var local = require('./local');

//don't let this get browserified because it uses ES6 which breaks uglify
var environmentVariableNodePackageName = 'dotenv';

var config = loadConfiguration();
makeLoggerGlobal();

var storeOptionsForCycles = null;

function loadConfiguration() {
    var config = {};
    var secureEnv = getSecureConfigFromEnvironment();

    config = _.merge(defaults, secureEnv, local);

    setMiddlewareUrl();
    setCouchDbUrl();
    setWebAppUrls();

    return config;

    function getSecureConfigFromEnvironment() {
        if (!isBrowserEnvironment()) {
            var parsedEnv = require(environmentVariableNodePackageName).config();

            var scheme = process.env['COUCH_DB_URL_SCHEME'];
            var user = process.env['COUCH_DB_USER'];
            var password = process.env['COUCH_DB_PASSWORD'];
            var host = process.env['COUCH_DB_HOST'];

            return {
                storeOptions: {
                    couchDbUrl: scheme + host,
                    privilegedCouchUrlScheme: scheme,
                    privilegedCouchUsername: user,
                    privilegedCouchPassword: password,
                    privilegedCouchHostname: host,
                    privilegedCouchDbUrl: scheme+user+':'+password+'@'+host
                }
            };
        }
        return {storeOptions: {}};
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
        }

        function setCouchDbUrlForBrowser() {
            var l = window.location;
            config.storeOptions.couchDbUrl = l.protocol + '//' + l.host + '/db';
        }
    }

    function setWebAppUrls() {
        if (isBrowserEnvironment()) {
            if (locationHostnameEndsWith('.qa.pixotech.com')) {
                config.staffWebAppUrl = "http://carli-staff.qa.pixotech.com";
                config.libraryWebAppUrl = "http://carli-library.qa.pixotech.com";
                config.vendorWebAppUrl = "http://carli-vendor.qa.pixotech.com";
            } else if (locationHostnameEndsWith('-stage.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff-stage.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library-stage.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor-stage.carli.illinois.edu";
            } else if (locationHostnameEndsWith('-devel.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff-devel.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library-devel.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor-devel.carli.illinois.edu";
            } else if (locationHostnameEndsWith('-test.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff-test.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library-test.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor-test.carli.illinois.edu";
            } else if (locationHostnameEndsWith('.carli.illinois.edu')) {
                config.staffWebAppUrl = "http://select-staff.carli.illinois.edu";
                config.libraryWebAppUrl = "http://select-library.carli.illinois.edu";
                config.vendorWebAppUrl = "http://select-vendor.carli.illinois.edu";
            } else {
                config.staffWebAppUrl = "http://staff.carli.local:8080/";
                config.libraryWebAppUrl = "http://library.carli.local:8080/";
                config.vendorWebAppUrl = "http://vendor.carli.local:8080/";
            }
        }
    }
}

function locationHostnameEndsWith(domain) {
    return window.location.hostname.slice(-1 * domain.length) === domain;
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
