angular.module('carli.sections.products')
.controller('productsController', productController);

function productController( $sce, productService ){
    var vm = this;
    vm.afterProductSubmit = populateProductList;
    activate();

    function activate() {
        productService.list().then( function(productList){
            vm.productList = productList;
        });
    }

    function populateProductList() {
        productService.list().then( function(productList){
            vm.productList = productList;
        });
    }

    vm.productListColumns = [
        {
            label: "Product Name",
            contentFunction: function(product) {
                return $sce.trustAsHtml('<a href="product/' + product.id + '">' + product.name + '</a>');
            }
        },
        {
            label: "Vendor",
            contentFunction: function(product) {
                var vendor = product.vendor || {};
                return vendor.name || "";
            }
        },
        {
            label: "Cycle",
            contentFunction: function(product) { return product.cycle; }
        }
    ];
}

