var config = require( '../../config' );
var Store = require( '../Store' );
var StoreModule = require( '../Store/CouchDb/Store');
var _ = require('lodash');

module.exports = function getStoreForCycle(cycle, storeOptions) {
    if (!cycleIsFullyExpanded(cycle)) {
        throw new Error('getStoreForCycle must be passed a fully expanded cycle instance');
    }
    if (typeof storeOptions === 'undefined') {
        storeOptions = config.getStoreOptionsForCycles();
    }

    return Store( StoreModule(_.extend({}, storeOptions, { couchDbName: cycle.getDatabaseName() })) );
};

function cycleIsFullyExpanded(cycle) {
    return cycle.hasOwnProperty('getDatabaseName') && typeof cycle.getDatabaseName == 'function';
}
