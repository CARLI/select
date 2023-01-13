var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , CycleRepository = require('./CycleRepository')
  , config = require( '../../config' )
  , couchUtils = require( '../Store/CouchDb/Utils')()
  , getStoreForCycle = require('./getStoreForCycle')
  , Validator = require('../Validator')
  , moment = require('moment')
  , Q = require('q')
  , _ = require('lodash')
  ;

var storeOptions = {};
var VendorStatusRepository = Entity('VendorStatus');

var propertiesToTransform = [/*'vendor'*/];

function transformFunction( vendorStatus ){
    EntityTransform.transformObjectForPersistence(vendorStatus, propertiesToTransform);
}

function expandVendorStatuses( listPromise ){
    return EntityTransform.expandListOfObjectsFromPersistence( listPromise, propertiesToTransform, functionsToAdd);
}

function createVendorStatus( vendorStatus, cycle ){
    Logger.log('Creating vendor status for vendor ' + vendorStatus.vendor + ' in cycle ' + cycle);
    setCycle(cycle);
    return VendorStatusRepository.create( vendorStatus, transformFunction );
}

function updateVendorStatus( vendorStatus, cycle ){
    setCycle(cycle);
    return VendorStatusRepository.update( vendorStatus, transformFunction );
}

function createOrUpdateVendorStatus( vendorStatus, cycle ) {
    return vendorStatus.id ? updateVendorStatus(vendorStatus, cycle) : createVendorStatus(vendorStatus, cycle);
}

function deleteVendorStatus( vendorStatus ) {
    return VendorStatusRepository.delete(vendorStatus.id);
}

function listVendorStatuses(cycle){
    setCycle(cycle);
    // 2023-01-12: we updated this function to remove duplicate VendorStatuses, always returning the one with the most recent lastActivity.
    //             there is a case we haven't tracked down where the system creates a duplicate VendorStatus document and then
    //             sometimes applies status updates to the wrong one
    const vendorStatusesPromise = expandVendorStatuses( VendorStatusRepository.list(cycle.getDatabaseName()) )
        .then(allVendorStatuses => {
            return allVendorStatuses.reduce((acc, vendorStatus) => {
                if (!acc[vendorStatus.vendor]) {
                    acc[vendorStatus.vendor] = vendorStatus;
                } else if (acc[vendorStatus.vendor].lastActivity < vendorStatus.lastActivity || !acc[vendorStatus.vendor].lastActivity) {
                    acc[vendorStatus.vendor] = vendorStatus;
                }

                return acc;
            }, {});
        });

    return vendorStatusesPromise.then(vendorStatuses => Object.values(vendorStatuses));
}

function loadVendorStatus( vendorStatusId, cycle ){
    var deferred = Q.defer();

    setCycle(cycle);
    VendorStatusRepository.load( vendorStatusId )
        .then(function (vendorStatus) {
            EntityTransform.expandObjectFromPersistence( vendorStatus, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(vendorStatus);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database to vendor in vendorStatus ', err);
                    deferred.resolve(vendorStatus);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function getStatusForVendor( vendorId, cycle ){
    setCycle(cycle);
    return listVendorStatuses(cycle)
        .then(vendorStatuses => { return vendorStatuses.filter(vendorStatus => vendorStatus.vendor === vendorId)})
        .then(function(statusesForVendor){
            if (statusesForVendor.length > 0){
                const status = statusesForVendor[0];
                return ensureDefaultsForStatus(status, cycle);
            }
            else {
                return newStatusForVendor(vendorId, cycle);
            }
        });
}

function newStatusForVendor( vendorId, cycle ){
    return {
        cycle: cycle.id, //I don't see a reason to expand cycles at present, so just save the ID manually here
        vendor: vendorId,
        description: 'No Activity',
        isClosed: false,
        flaggedOfferingsCount: 0,
        flaggedOfferingsReasons: {},
        progress: 0,
        checklist: {
            siteLicense: false,
            simultaneousUsers: false,
            descriptions: false
        }
    }
}

function ensureDefaultsForStatus( vendorStatus, cycle ){
    var defaults = newStatusForVendor( vendorStatus.vendor, cycle );
    return _.merge(defaults, vendorStatus);
}

function ensureStatusExistsForVendor( vendorId, cycle ){
    setCycle(cycle);
    return getStatusForVendor( vendorId, cycle )
        .then(function( vendorStatus ){
            return vendorStatus.id ? vendorStatus.id : createVendorStatus(vendorStatus, cycle);
        });
}

function reset( vendorStatus ){
    if ( !vendorStatus ){
        return;
    }

    vendorStatus.lastActivity = null;
    vendorStatus.description = 'No Activity';
    vendorStatus.isClosed = false;
    vendorStatus.flaggedOfferingsCount = 0;
    vendorStatus.flaggedOfferingsReasons = {};
    vendorStatus.progress = 0;
    vendorStatus.checklist = {
        siteLicense: false,
        simultaneousUsers: false,
        descriptions: false
    };

    return vendorStatus;
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    setStore(getStoreForCycle(cycle, storeOptions));
}


var functionsToAdd = {};

function setStore(store) {
    storeOptions = store.getOptions();
    VendorStatusRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(storeOptions);
}

module.exports = {
    setStore: setStore,
    setCycle: setCycle,
    create: createVendorStatus,
    update: updateVendorStatus,
    createOrUpdate: createOrUpdateVendorStatus,
    delete: deleteVendorStatus,
    list: listVendorStatuses,
    load: loadVendorStatus,
    getStatusForVendor: getStatusForVendor,
    ensureStatusExistsForVendor: ensureStatusExistsForVendor,
    reset: reset
};
