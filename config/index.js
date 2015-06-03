var _ = require('lodash')
  , localConfig = require('./local');

var couchDbName = 'carli';

var defaults = {
    alertTimeout: 10000,
    cookieDomain: 'carli.local',
    middleware: {
        url: 'http://staff.carli.local:8080/api',
        port: 3000
    },
    storeOptions: {
        couchDbUrl: 'http://staff.carli.local:8080/db',
        couchDbName: couchDbName,
        privilegedCouchDbUrl: 'http://admin:relax@localhost:5984'
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

var config = _.extend(defaults, localConfig);

defaults.setDbName = function(name) {
    couchDbName = name;
};
defaults.getDbName = function() {
    return couchDbName;
};
defaults.getMiddlewareUrl = function() {
    return config.middleware.url;
};

module.exports = config;
