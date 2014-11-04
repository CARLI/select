angular.module('carli.libraryService')
    .service('libraryService', libraryService);

function libraryService( CarliModules ) {

    var libraryModule = CarliModules.Library;

    var libraryStore = CarliModules.Store( CarliModules.MemoryStore );

    libraryModule.setStore( libraryStore );

    return {
        list: libraryModule.list,
        create: libraryModule.create,
        update: libraryModule.update,
        load: libraryModule.load,

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
