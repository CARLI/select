var _ = require('lodash')
  , localConfig = require('./local');

var couchDbName = 'carli';

var defaults = {
    alertTimeout: 10000,
    middleware: {
        url: 'http://localhost:3000',
        port: 3000
    },
    storeOptions: {
        couchDbUrl: 'http://localhost:5984',
        couchDbName: couchDbName
    },
    memberDb: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'carli_crm'
    },
    oneTimePurchaseProductsCycleDocId: 'one-time-purchase-products-cycle',
    storePath: 'CouchDb/Store',
    defaultEntityCacheTimeToLive: 60 * 1000,
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
