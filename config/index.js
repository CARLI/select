var _ = require('lodash')
  , localConfig = require('./local');

var couchDbName = 'carli';
var storeOptionsForCycles = null;

var defaults = {
    alertTimeout: 10000,
    cookieDomain: 'carli.local',
    middleware: {
        url: 'http://staff.carli.local:8080/api',
        port: 3000
    },
    storeOptions: {
        couchDbName: couchDbName,
        couchDbUrl: 'http://staff.carli.local:8080/db',
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
    defaultEntityCacheTimeToLive: -1, // 60 * 1000,
    showFullErrors: false,
    errorMessages: {
        fatal: "A serious error occurred, please ask Cate what this should say."
    }
};

var config = _.merge(defaults, localConfig);

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
    return storeOptionsForCycles;
};

module.exports = config;
