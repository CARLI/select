angular.module('carli.libraryService')
    .service('libraryService', libraryService);

function libraryService( CarliModules, $q ) {

    var libraryModule = CarliModules.Library;

    return {
        list:   function() { return $q.when( libraryModule.list() ); },
        create: function() { return $q.when( libraryModule.create.apply( this, arguments) ); },
        update: function() { return $q.when( libraryModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( libraryModule.load.apply( this, arguments) ); },

        getMostRecentFteUpdateDate: function() {
            return "Jan 1, 1970";
        },

        getInstitutionTypeOptions: libraryModule.getInstitutionTypeOptions,
        getInstitutionYearsOptions: libraryModule.getInstitutionYearsOptions,
        getMembershipLevelOptions: libraryModule.getMembershipLevelOptions
    };
}
