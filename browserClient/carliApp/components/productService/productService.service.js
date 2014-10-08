angular.module('carli.productService')
    .service('productService', productService);

function productService($resource) {
    var service = {};
    var productListResource = $resource('/resources/product/list.json');

    service.getProductList = productListResource.query;
    service.getProduct = function( productId ){
        var productResource = $resource('/resources/product/'+productId+'/data.json');
        return productResource.get();
    };

    return service;
}