var _ = require('lodash');
var defaults = require('./defaults');
var local = require('./local');
var secure = {};
var secureConfigPath = null;

concealSecureConfigFromBrowserify();

var couchDbName = 'carli';
var storeOptionsForCycles = null;

var defaults = {
    alertTimeout: 10000,
    cookieDomain: 'carli.local',
    middleware: {
        url: 'http://vendor.carli.local:8080/api',
        port: 3000
    },
    storeOptions: {
        couchDbName: couchDbName,
        couchDbUrl: 'http://vendor.carli.local:8080/db',
        privilegedCouchUsername: 'admin',
        privilegedCouchPassword: 'relax',
        privilegedCouchUrlScheme: 'http://',
        privilegedCouchHostname: 'localhost:5984'
    },
    memberDb: {
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'carli_crm'
    },
    oneTimePurchaseProductsCycleDocId: 'one-time-purchase-products-cycle',
    storePath: 'CouchDb/Store',
    defaultEntityCacheTimeToLive: -1 // 60 * 1000
};

var config = _.merge(defaults, localConfig);

function concealSecureConfigFromBrowserify() {
    if (isSecureEnvironment()) {
        secureConfigPath = './secure';
    }

    if (secureConfigPath) {
        secure = require(secureConfigPath);
    }

    function isSecureEnvironment() {
        return !isBrowserEnvironment();
    }

    function isBrowserEnvironment() {
        return (typeof window !== 'undefined');
    }
}

if (!config.storeOptions.privilegedCouchDbUrl) {
    config.storeOptions.privilegedCouchDbUrl = config.storeOptions.privilegedCouchUrlScheme +
        config.storeOptions.privilegedCouchUsername + ':' +
        config.storeOptions.privilegedCouchPassword + '@' +
        config.storeOptions.privilegedCouchHostname;
}

config.setDbName = function(name) {
    couchDbName = name;
};
config.getDbName = function() {
    return couchDbName;
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
