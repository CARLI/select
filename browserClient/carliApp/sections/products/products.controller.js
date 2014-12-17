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
            orderByProperty: 'name',
            contentFunction: function(product) {
                return $sce.trustAsHtml('<a href="product/' + product.id + '">' + product.name + '</a>');
            }
        },
        {
            label: "Vendor",
            orderByProperty: 'vendor',
            contentFunction: function(product) {
                var vendor = product.vendor || {};
                return vendor.name || "";
            }
        },
        {
            label: "Cycle",
            orderByProperty: 'cycle',
            contentFunction: function(product) { return product.cycle; }
        }
    ];
}

