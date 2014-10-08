angular.module('carli.sections.products')
.controller('productsController', function( productService ){

        this.productList = productService.getProductList();
});
