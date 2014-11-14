angular.module('carli.libraryService')
    .service('libraryService', libraryService);

function libraryService( CarliModules, $q ) {

    var libraryModule = CarliModules.Library;

    var libraryStore = CarliModules.Store( CarliModules[CarliModules.config.store]() );

    libraryModule.setStore( libraryStore );

    return {
        list:   function() { return $q.when( libraryModule.list() ); },
        create: function() { return $q.when( libraryModule.create.apply( this, arguments) ); },
        update: function() { return $q.when( libraryModule.update.apply( this, arguments) ); },
        load:   function() { return $q.when( libraryModule.load.apply( this, arguments) ); },

        getMostRecentFteUpdateDate: function() {
            return "Jan 1, 1970";
        },

        getInstitutionYearsOptions: function(){
            return [
                "4 Year",
                "2 Year",
                "Other"
            ];
        },

        getInstitutionTypeOptions: function(){
            return [
                "Private",
                "Public",
                "Other"
            ];
        },

        getMembershipLevelOptions: function(){
            return [
                "Governing",
                "Affiliate",
                "Non-Member"
            ];
        }
    };
}
