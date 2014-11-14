angular.module('carli.sections.libraries')
.controller('librariesController', libraryController);

function libraryController( $sce, libraryService ){
    var vm = this;

    vm.mostRecentFteUpdateDate = libraryService.getMostRecentFteUpdateDate();
    vm.saveAllLibraries = saveAllLibraries;
    vm.fteModalId = 'edit-fte-modal';
    vm.fteModalSubmit = function() {
        vm.saveAllLibraries();
    };

    libraryService.list().then( function( libraryList ){
        vm.libraryList = libraryList;
    });

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
}
