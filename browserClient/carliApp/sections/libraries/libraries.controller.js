angular.module('carli.sections.libraries')
.controller('librariesController', libraryController);

function libraryController( libraryService ){
    var vm = this;

    vm.libraryList = libraryService.list();
    vm.activeFilterState = 'Active';
}
