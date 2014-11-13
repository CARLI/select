angular.module('carli.sections.products')
.controller('productsController', productController);

function productController( $sce, productService ){
    var vm = this;
    activate();

    function activate() {
        vm.productList = productService.list();
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
            contentFunction: function(product) { return product.vendor; }
        },
        {
            label: "Cycle",
            contentFunction: function(product) { return product.cycle; }
        }
    ];
}

