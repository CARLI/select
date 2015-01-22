var _ = require('lodash')
  , localConfig = require('./local');

var couchDbName = 'carli';

var defaults = {
    alertTimeout: 10000,
    storeOptions: {
        couchDbUrl: 'http://localhost:5984',
        couchDbName: couchDbName
    },
    request: require('../carliRequest'),
    storePath: 'CouchDb/Store',
    setDbName: function(name) {
        couchDbName = name;
    },
    getDbName: function() {
        return couchDbName;
    }
};

module.exports = _.extend(defaults, localConfig);
