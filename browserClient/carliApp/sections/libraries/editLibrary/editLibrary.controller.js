angular.module('carli.sections.libraries.edit')
    .controller('editLibraryPageController', editLibraryPageController);

function editLibraryPageController( $routeParams, $location ) {
    var vm = this;
    vm.libraryId = $routeParams.id;
    vm.afterLibrarySubmit = routeToLibraryList;

    function routeToLibraryList() {
        $location.path('/library');
    }
}
