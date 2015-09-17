angular.module('common.libraryStatusService')
    .service('libraryStatusService', libraryStatusService);

function libraryStatusService( CarliModules, $q, errorHandler ) {

    var libraryStatusModule = CarliModules.LibraryStatus;

    return {
        list:   function(cycle) { return $q.when( libraryStatusModule.list(cycle)).catch(errorHandler); },
        create: function() { return $q.when( libraryStatusModule.create.apply(this, arguments) ); },
        update: updateLibraryStatus,
        load:   function() { return $q.when( libraryStatusModule.load.apply(this, arguments) ).catch(errorHandler); },
        getStatusForLibrary: getStatusForLibrary,
        markLibrarySelectionsComplete: markLibrarySelectionsComplete,
        markLibrarySelectionsIncomplete: markLibrarySelectionsIncomplete,
        getStatusesForAllLibraries: getStatusesForAllLibraries,
        updateLastActivity: updateLastActivity
    };

    function updateLibraryStatus( libraryStatus, cycle ){
        return $q.when( libraryStatusModule.update(libraryStatus, cycle) );
    }

    function getStatusForLibrary( libraryId, cycle ) {
        return $q.when( libraryStatusModule.getStatusForLibrary(libraryId, cycle) )
            .catch(errorHandler);
    }

    function markLibrarySelectionsComplete( libraryId, cycle ){
        return $q.when( libraryStatusModule.markLibrarySelectionsComplete(libraryId, cycle) )
            .catch(errorHandler);
    }

    function markLibrarySelectionsIncomplete( libraryId, cycle ){
        return $q.when( libraryStatusModule.markLibrarySelectionsIncomplete(libraryId, cycle) )
            .catch(errorHandler);
    }

    function getStatusesForAllLibraries( cycle ){
        return $q.when( libraryStatusModule.getStatusesForAllLibraries(cycle) )
            .catch(errorHandler);
    }

    function updateLastActivity( libraryId, cycle ){
        return $q.when( libraryStatusModule.updateLastActivity(libraryId, cycle) )
            .catch(errorHandler);
    }
}
