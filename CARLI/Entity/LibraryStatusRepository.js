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

            if ( libraryStatus.id ){
                return updateLibraryStatus(libraryStatus, cycle);
            }
            else {
                return createLibraryStatus(libraryStatus, cycle);
            }
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
    getStatusesForAllLibraries: getStatusesForAllLibraries
};
