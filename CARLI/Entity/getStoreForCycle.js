var config = require( '../../config' );
var defaultStoreOptions = config.getStoreOptionsForCycles();
var Store = require( '../Store' );
var StoreModule = require( '../Store/CouchDb/Store');
var _ = require('lodash');

module.exports = function getStoreForCycle(cycle) {
    if (!cycleIsFullyExpanded(cycle)) {
        throw new Error('getStoreForCycle must be passed a fully expanded cycle instance');
    }
    return Store( StoreModule(_.extend({}, defaultStoreOptions, { couchDbName: cycle.getDatabaseName() })) );
};

function cycleIsFullyExpanded(cycle) {
    return cycle.hasOwnProperty('getDatabaseName') && typeof cycle.getDatabaseName == 'function';
}
