angular.module('carli.sections.products')
.controller('productsController', productsController);

function productsController( productService ){
    var vm = this.

    vm.productList = productService.getProductList();
}
