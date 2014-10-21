angular.module('carli.sections.products.edit')
.controller('editProductController', function( $routeParams, productService ){
    var vm = this;
    var productId = $routeParams.id;

    vm.product = productService.getProduct(productId);
});
