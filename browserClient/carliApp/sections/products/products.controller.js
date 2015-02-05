angular.module('carli.sections.products')
.controller('productsController', productController);

function productController( $scope, $sce, cycleService, productService ){
    var vm = this;
    vm.activeCycles = [];
    vm.afterProductSubmit = populateProductList;
    activate();

    function activate() {
        cycleService.listActiveCycles().then(function(activeCycles) {
            vm.activeCycles = activeCycles;
        });
        watchCurrentCycle();
    }

    function watchCurrentCycle() {
        $scope.$watch(cycleService.getCurrentCycle, function (newValue) {
            if (newValue) {
                populateProductList();
            }
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
            orderByProperty: 'vendor.name',
            contentFunction: function(product) {
                var vendor = product.vendor || {};
                return vendor.name || "";
            }
        },
        {
            label: "Cycle",
            orderByProperty: 'cycle',
            contentFunction: function(product) { return product.cycleType; }
        }
    ];

}

