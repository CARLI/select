angular.module('carli.sections.users.edit')
    .controller('editUserPageController', editUserPageController);

function editUserPageController( $routeParams, $location ) {
    var vm = this;
    vm.userId = $routeParams.id;
}
