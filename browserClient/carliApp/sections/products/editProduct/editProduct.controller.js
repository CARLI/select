angular.module('carli.sections.products.edit')
    .controller('editProductPageController', editProductPageController);

function editProductPageController( $routeParams, $location ) {
    var vm = this;
    vm.productId = $routeParams.id;
}