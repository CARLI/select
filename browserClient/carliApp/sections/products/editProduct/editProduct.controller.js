angular.module('carli.sections.products.edit')
.controller('editProductController', editProductController);

function editProductController( $routeParams, productService ){
    var vm = this;
    var productId = $routeParams.id;

    vm.product = productService.getProduct(productId);
}
