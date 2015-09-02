var Entity = require('../Entity');
var EntityTransform = require( './EntityTransformationUtils');
var config = require( '../../config' );
var couchUtils = require('../Store/CouchDb/Utils')();
var Store = require( '../Store' );
var storeOptions = config.storeOptions;
var StoreModule = require( '../Store/CouchDb/Store');
var Q = require('q');

var activityLogDbName = 'activity-log';

var ActivityLog = Entity('ActivityLogEntry');
var repositoryStoreOptions = {
    couchDbUrl: storeOptions.couchDbUrl,
    couchDbName: activityLogDbName
};

ActivityLog.setStore( Store( StoreModule(repositoryStoreOptions) ) );

function listActivityBetween(startDate, endDate){
    return couchUtils.getCouchViewResultValuesWithinRange(activityLogDbName, 'listActivityLogsByDate', startDate, endDate);
}

function listActivitySince(startDate){
    return couchUtils.getCouchViewResultValuesWithinRange(activityLogDbName, 'listActivityLogsByDate', startDate, '9999');
}

function setStore(store) {
    ActivityLog.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(store.getOptions());
    EntityTransform.setEntityLookupStores(store);
}

module.exports = {
    setStore: setStore,
    create: ActivityLog.create,
    list: ActivityLog.list,
    listActivityBetween: listActivityBetween,
    listActivitySince: listActivitySince
};
