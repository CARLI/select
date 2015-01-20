var _ = require('lodash')
  , localConfig = require('./local');

var defaults = {
    alertTimeout: 10000,
    storeOptions: {
        couchDbUrl: 'http://localhost:5984',
        couchDbName: 'carli'
    },
    request: require('../carliRequest'),
    storePath: 'CouchDb/Store'
};

module.exports = _.extend(defaults, localConfig);
