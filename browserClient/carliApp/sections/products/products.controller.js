angular.module('carli.sections.products')
.controller('productsController', function( productService ){
    var vm = this.

    vm.productList = productService.getProductList();
});
