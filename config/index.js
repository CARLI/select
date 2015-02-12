var _ = require('lodash')
  , localConfig = require('./local');

var couchDbName = 'carli';

var defaults = {
    alertTimeout: 10000,
    middleware: {
        protocol: 'http',
        hostname: 'localhost',
        port: 3000
    },
    storeOptions: {
        couchDbUrl: 'http://localhost:5984',
        couchDbName: couchDbName
    },
    oneTimePurchaseProductsCycleDocId: 'one-time-purchase-products-cycle',
    storePath: 'CouchDb/Store',
    defaultEntityCacheTimeToLive: 60 * 1000,
    errorMessages: {
        fatal: "A serious error occurred, please ask Cate what this should say."
    }
};

defaults.setDbName = function(name) {
    couchDbName = name;
};
defaults.getDbName = function() {
    return couchDbName;
};
defaults.getMiddlewareUrl = function() {
    return defaults.middleware.protocol + '://' + defaults.middleware.hostname + ':' + defaults.middleware.port;
};

module.exports = _.extend(defaults, localConfig);
