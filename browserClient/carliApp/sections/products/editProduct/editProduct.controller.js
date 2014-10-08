angular.module('carli.sections.products.edit')
.controller('editProductController', function( $routeParams, productService ){

        var productId = $routeParams.id;

        this.product = productService.getProduct(productId);
});
