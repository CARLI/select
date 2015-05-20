angular.module('common.libraryService')
    .service('libraryService', libraryService);

function libraryService( CarliModules, $q, errorHandler ) {

    var libraryModule = CarliModules.Library;

    return {
        list:   function() { return $q.when( libraryModule.list() ).catch(errorHandler); },
        update: function() { return $q.when( libraryModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( libraryModule.load.apply( this, arguments) ).catch(errorHandler); },
        listActiveLibraries: function(cycle){ return $q.when(libraryModule.listActiveLibraries()).catch(errorHandler); },
        listLibrariesWithSelectionsInCycle: function(cycle){
            return $q.when(libraryModule.listLibrariesWithSelectionsInCycle(cycle)).catch(errorHandler);
        },

        getInstitutionTypeOptions: libraryModule.getInstitutionTypeOptions,
        getInstitutionYearsOptions: libraryModule.getInstitutionYearsOptions,
        getMembershipLevelOptions: libraryModule.getMembershipLevelOptions,
        getLibrariesById: function(ids) {
            return $q.when( libraryModule.getLibrariesById(ids) ).catch(errorHandler);
        }
    };
}
