angular.module('carli.sections.products')
.controller('productsController', productController);

function productController( $sce, cycleService, productService ){
    var vm = this;
    vm.currentCycle = cycleService.getCurrentCycle();
    vm.activeCycles = [];
    vm.setCurrentCycle = setCurrentCycle;
    vm.afterProductSubmit = populateProductList;
    activate();

    function activate() {
        cycleService.listActiveCycles().then(function(activeCycles) {
            vm.activeCycles = activeCycles;
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

    function setCurrentCycle(){
        cycleService.setCurrentCycle( vm.currentCycle );

        productService.list().then( function(productList){
            vm.productList = productList;
        });
    }
}

