var Entity = require('../Entity')
  , EntityTransform = require( './EntityTransformationUtils')
  , CycleRepository = require('./CycleRepository')
  , config = require( '../../config' )
  , couchUtils = require( '../Store/CouchDb/Utils')
  , getStoreForCycle = require('./getStoreForCycle')
  , Validator = require('../Validator')
  , moment = require('moment')
  , Q = require('q')
  ;

var VendorStatusRepository = Entity('VendorStatus');

var propertiesToTransform = [/*'vendor'*/];

function transformFunction( vendorStatus ){
    EntityTransform.transformObjectForPersistence(vendorStatus, propertiesToTransform);
}

function expandVendorStatuses( listPromise ){
    return EntityTransform.expandListOfObjectsFromPersistence( listPromise, propertiesToTransform, functionsToAdd);
}

function createVendorStatus( vendorStatus, cycle ){
    setCycle(cycle);
    return VendorStatusRepository.create( vendorStatus, transformFunction );
}

function updateVendorStatus( vendorStatus, cycle ){
    setCycle(cycle);
    return VendorStatusRepository.update( vendorStatus, transformFunction );
}

function listVendorStatuses(cycle){
    setCycle(cycle);
    return expandVendorStatuses( VendorStatusRepository.list(cycle.getDatabaseName()) );
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
    return expandVendorStatuses(couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listVendorStatusesByVendorId', vendorId))
        .then(function(statusesForVendor){
            if ( statusesForVendor.length > 0 ){
                return statusesForVendor[0];
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
        offeringFlaggedCount: 0
    }
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
    vendorStatus.offeringFlaggedCount = 0;

    return vendorStatus;
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    VendorStatusRepository.setStore(getStoreForCycle(cycle));
}


var functionsToAdd = {};

module.exports = {
    setStore: VendorStatusRepository.setStore,
    setCycle: setCycle,
    create: createVendorStatus,
    update: updateVendorStatus,
    list: listVendorStatuses,
    load: loadVendorStatus,
    getStatusForVendor: getStatusForVendor,
    ensureStatusExistsForVendor: ensureStatusExistsForVendor,
    reset: reset
};
