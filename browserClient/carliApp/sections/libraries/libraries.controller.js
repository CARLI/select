angular.module('carli.sections.libraries')
.controller('librariesController', libraryController);

function libraryController( $sce, libraryService ){
    var vm = this;
    vm.afterLibrarySubmit = populateLibraryList;

    activate();

    function activate(){
        populateLibraryList();
    }

    function populateLibraryList() {
        vm.loadingPromise = libraryService.list().then( function( libraryList ){
            vm.libraryList = libraryList;
        });
    }

    vm.entityListColumns = [
        {
            'label': 'Library Name',
            orderByProperty: 'name',
            'contentFunction': function(library) { return $sce.trustAsHtml('<a href="/library/' + library.id +'">' + library.name + '</a>'); }
        },
        {
            'label': 'Institution Years',
            orderByProperty: 'institutionYears',
            'contentFunction': function(library) { return library.institutionYears; }
        },
        {
            'label': 'Institution Type',
            orderByProperty: 'institutionType',
            'contentFunction': function(library) { return library.institutionType; }
        }
    ];
}
