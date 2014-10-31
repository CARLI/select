angular.module('carli.sections.libraries')
.controller('librariesController', libraryController);

var testLibraries = [
    {"type":"Library", "name":"Test Library 1", "fte":0, "institutionYears":"2 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library 2", "fte":0, "institutionYears":"2 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library your mom", "fte":0, "institutionYears":"2 Year", "institutionType":"Private"},
    {"type":"Library", "name":"Test Library 3", "fte":0, "institutionYears":"2 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library 4", "fte":0, "institutionYears":"4 Year", "institutionType":"Private"},
    {"type":"Library", "name":"Test Library 5", "fte":0, "institutionYears":"4 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library 6", "fte":0, "institutionYears":"2 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library Seven", "fte":0, "institutionYears":"2 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library 8", "fte":0, "institutionYears":"4 Year", "institutionType":"Public"},
    {"type":"Library", "name":"Test Library 9", "fte":0, "institutionYears":"4 Year", "institutionType":"Private"}
];

function libraryController( $sce, libraryService ){
    var vm = this;

    function createTestLibraries() {
        testLibraries.forEach(function (l) {
            libraryService.create(l);
        });
    }
    createTestLibraries();

    vm.libraryList = libraryService.list();
    vm.activeFilterState = 'Active';


    vm.entityListColumns = [
        {
            'label': 'Library Name',
            'contentFunction': function(library) { return $sce.trustAsHtml('<a href="/library/' + library.id +'">' + library.name + '</a>'); }
        },
        {
            'label': 'Institution Years',
            'contentFunction': function(library) { return library.institutionYears; }
        },
        {
            'label': 'Institution Type',
            'contentFunction': function(library) { return library.institutionType; }
        }
    ];
}
