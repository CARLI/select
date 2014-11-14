var _ = require('lodash')
  , localConfig = require('./local');

var defaults = {
    storeOptions: {
        couchDbUrl: 'http://localhost:5984',
        couchDbName: 'testy'
    },
    request: require('../carliRequest'),
    store: 'CouchDbStore'
};

module.exports = _.extend(defaults, localConfig);
