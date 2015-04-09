var config = require( '../../config' );
var StoreOptions = config.storeOptions;
var Store = require( '../Store' );
var StoreModule = require( '../Store/CouchDb/Store');
var _ = require('lodash');

module.exports = function getStoreForCycle(cycle) {
    return Store( StoreModule(_.extend({}, StoreOptions, { couchDbName: cycle.getDatabaseName() })) );
};
