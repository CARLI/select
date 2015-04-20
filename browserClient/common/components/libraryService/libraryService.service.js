angular.module('common.libraryService')
    .service('libraryService', libraryService);

function libraryService( CarliModules, $q ) {

    var libraryModule = CarliModules.Library;

    return {
        list:   function() { return $q.when( libraryModule.list() ); },
        update: function() { return $q.when( libraryModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( libraryModule.load.apply( this, arguments) ); },
        listActiveLibraries: function(cycle){ return $q.when(libraryModule.listActiveLibraries()); },
        listLibrariesWithSelectionsInCycle: function(cycle){
            return $q.when(libraryModule.listLibrariesWithSelectionsInCycle(cycle));
        },

        getInstitutionTypeOptions: libraryModule.getInstitutionTypeOptions,
        getInstitutionYearsOptions: libraryModule.getInstitutionYearsOptions,
        getMembershipLevelOptions: libraryModule.getMembershipLevelOptions,
        getLibrariesById: function(ids) {
            return $q.when( libraryModule.getLibrariesById(ids) );
        }
    };
}
