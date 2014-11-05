angular.module('carli.sections.libraries')
.controller('librariesController', libraryController);

var testLibraries = [
    {"type":"Library", "name":"Test Library 1", "institutionYears":"2 Year", "institutionType":"Public", "isActive":true, "contacts":[]},
    {"type":"Library", "name":"Test Library 2", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
    {"type":"Library", "name":"Test Library your mom", "institutionYears":"2 Year", "institutionType":"Private", "contacts":[]},
    {"type":"Library", "name":"Test Library 3", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
    {"type":"Library", "name":"Test Library 4", "institutionYears":"4 Year", "institutionType":"Private", "contacts":[]},
    {"type":"Library", "name":"Test Library 5", "institutionYears":"4 Year", "institutionType":"Public", "contacts":[]},
    {"type":"Library", "name":"Test Library 6", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
    {"type":"Library", "name":"Test Library Seven", "institutionYears":"2 Year", "institutionType":"Public", "contacts":[]},
    {"type":"Library", "name":"Test Library 8", "institutionYears":"4 Year", "institutionType":"Public", "contacts":[]},
    {"type":"Library", "name":"Test Library 9", "institutionYears":"4 Year", "institutionType":"Private", "contacts":[]}
];

function libraryController( $sce, libraryService ){
    var vm = this;

    vm.mostRecentFteUpdateDate = libraryService.getMostRecentFteUpdateDate();
    vm.saveAllLibraries = saveAllLibraries;
    vm.closeFteModal = closeFteModal;

    function createTestLibraries() {
        testLibraries.forEach(function (l) {
            libraryService.create(l);
        });
    }
    createTestLibraries();

    vm.libraryList = libraryService.list();

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

    function saveAllLibraries() {
        for (var i in vm.libraryList) {
            libraryService.update( vm.libraryList[i]);
        }
    }

    function closeFteModal() {
        $('#editFteModal').modal('hide');
    }
}
