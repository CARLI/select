angular.module('carli.libraryService')
    .service('libraryService', libraryService);

function libraryService( CarliModules, $q ) {

    var libraryModule = CarliModules.Library;

    var libraryStore = CarliModules.Store( CarliModules.MemoryStore({}) );

    libraryModule.setStore( libraryStore );

    /* This is fixture data. It can go away. */
    var testLibraries = [
        {"type":"Library", "isActive":true, "name":"Test Library", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":false, "name":"Inactive Library", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library long name", "institutionYears":"2 Year", "institutionType":"Private", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library with a much longer name than usual", "institutionYears":"4 Year", "institutionType":"Public", "contacts":[]},
        {"type":"Library", "isActive":true, "name":"Test Library 5", "institutionYears":"4 Year", "institutionType":"Private", "contacts":[]}
    ];
    function createTestLibraries() {
        testLibraries.forEach(function (l) {
            libraryModule.create(l);
        });
    }
    createTestLibraries();
    /////////////////


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
