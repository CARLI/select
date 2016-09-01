var _ = require('lodash');
var moment = require('moment');
var Q = require('q');

var carliError = require('../Error');
var config = require( '../../config' );
var couchUtils = require( '../Store/CouchDb/Utils')();
var CycleRepository = require('./CycleRepository');
var Entity = require('../Entity');
var EntityTransform = require( './EntityTransformationUtils');
var getStoreForCycle = require('./getStoreForCycle');
var Validator = require('../Validator');

var storeOptions = {};
var LibraryStatusRepository = Entity('LibraryStatus');

var propertiesToTransform = [/*'library'*/];

function transformFunction( libraryStatus ){
    EntityTransform.transformObjectForPersistence(libraryStatus, propertiesToTransform);
}

function expandLibraryStatuses( listPromise ){
    return EntityTransform.expandListOfObjectsFromPersistence( listPromise, propertiesToTransform, functionsToAdd);
}

function createLibraryStatus( libraryStatus, cycle ){
    setCycle(cycle);
    return LibraryStatusRepository.create( libraryStatus, transformFunction );
}

function updateLibraryStatus( libraryStatus, cycle ){
    setCycle(cycle);
    return LibraryStatusRepository.update( libraryStatus, transformFunction );
}

function createOrUpdateLibraryStatus(libraryStatus, cycle) {
    if ( libraryStatus.id ){
        return updateLibraryStatus(libraryStatus, cycle);
    }
    else {
        return createLibraryStatus(libraryStatus, cycle);
    }
}

function listLibraryStatuses(cycle){
    setCycle(cycle);
    return expandLibraryStatuses( LibraryStatusRepository.list(cycle.getDatabaseName()) );
}

function loadLibraryStatus( libraryStatusId, cycle ){
    var deferred = Q.defer();

    setCycle(cycle);
    LibraryStatusRepository.load( libraryStatusId )
        .then(function (libraryStatus) {
            EntityTransform.expandObjectFromPersistence( libraryStatus, propertiesToTransform, functionsToAdd )
                .then(function () {
                    deferred.resolve(libraryStatus);
                })
                .catch(function(err){
                    // WARNING: this suppresses errors for entity references that are not found in the store
                    //console.warn('*** Cannot find reference in database to library in libraryStatus ', err);
                    deferred.resolve(libraryStatus);
                });
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}

function getStatusForLibrary( libraryId, cycle ){
    setCycle(cycle);
    return expandLibraryStatuses(couchUtils.getCouchViewResultValues(cycle.getDatabaseName(), 'listLibraryStatusesByLibraryId', libraryId))
        .then(function(statusesForLibrary){
            if ( statusesForLibrary.length > 0 ){
                var status = statusesForLibrary[0];
                return ensureDefaultsForStatus(status, cycle);
            }
            else {
                return newStatusForLibrary(libraryId, cycle);
            }
        });
}

function newStatusForLibrary( libraryId, cycle ){
    return {
        cycle: cycle.id, //I don't see a reason to expand cycles at present, so just save the ID manually here
        library: libraryId,
        isComplete: false
    }
}

function ensureDefaultsForStatus( libraryStatus, cycle ){
    var defaults = newStatusForLibrary( libraryStatus.library, cycle );
    return _.extend(defaults, libraryStatus);
}

function setCycle(cycle) {
    if (cycle === undefined) {
        throw Error("Cycle is required");
    }
    setStore(getStoreForCycle(cycle, storeOptions));
}

function markLibrarySelectionsComplete( libraryId, cycle ){
    return getStatusForLibrary(libraryId, cycle)
        .then(function(libraryStatus){
            libraryStatus.isComplete = true;
            return createOrUpdateLibraryStatus(libraryStatus, cycle);
        });
}

function markLibrarySelectionsIncomplete( libraryId, cycle ){
    return getStatusForLibrary(libraryId, cycle)
        .then(function(libraryStatus){
            libraryStatus.isComplete = false;
            return createOrUpdateLibraryStatus(libraryStatus, cycle);
        });
}

function getStatusesForAllLibraries( cycle ){
    return listLibraryStatuses(cycle)
        .then(mapLibraryStatusesById);

    function mapLibraryStatusesById( arrayOfStatusObjects ){
        var statusMap = {};

        arrayOfStatusObjects.forEach(function(statusObject){
            statusMap[statusObject.library] = statusObject;
        });

        return statusMap;
    }
}

function updateLastActivity(libraryId, cycle) {
    if (!libraryId) {
        throw carliError('No library');
    }
    return getStatusForLibrary(libraryId, cycle)
        .then(function(libraryStatus){
            libraryStatus.lastActivity = new Date().toISOString();
            return createOrUpdateLibraryStatus(libraryStatus, cycle);
        })
        .catch(function (error) {
            if (!isForbiddenError(error))
                throw carliError(error);
        });

    function isForbiddenError(e) {
        return e.message == 'forbidden';
    }
}

function setStore(store) {
    storeOptions = store.getOptions();
    LibraryStatusRepository.setStore(store);
    couchUtils = require('../Store/CouchDb/Utils')(storeOptions);
}

var functionsToAdd = {};

module.exports = {
    setStore: setStore,
    setCycle: setCycle,
    create: createLibraryStatus,
    update: updateLibraryStatus,
    list: listLibraryStatuses,
    load: loadLibraryStatus,
    getStatusForLibrary: getStatusForLibrary,
    markLibrarySelectionsComplete: markLibrarySelectionsComplete,
    markLibrarySelectionsIncomplete: markLibrarySelectionsIncomplete,
    getStatusesForAllLibraries: getStatusesForAllLibraries,
    updateLastActivity: updateLastActivity
};
