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
        vm.loadingPromise = productService.list().then( function(productList){
            vm.productList = productList;
        });
    }

    vm.productListColumns = [
        {
            label: "Product Name",
            orderByProperty: 'name',
            contentFunction: function(product) {
                return $sce.trustAsHtml('<a href="product/' + product.id + '">' + productService.getProductDisplayName(product) + '</a>');
            }
        },
        {
            label: "Vendor",
            orderByProperty: ['vendor.name','name'],
            contentFunction: function(product) {
                var vendor = product.vendor || {};
                if (vendor) {
                    return $sce.trustAsHtml('<a href="vendor/' + vendor.id + '">' + vendor.name + '</a>');
                } else {
                    return '';
                }
            }
        },
        {
            label: "License",
            orderByProperty: ['license.name','name'],
            contentFunction: function(product) {
                var license = product.license || {};
                if (license) {
                    return $sce.trustAsHtml('<a href="license/' + license.id + '">' + license.name + '</a>');
                } else {
                    return '';
                }
            }
        },
        {
            label: "Contract Number",
            orderByProperty: ['license.contractNumber','name'],
            contentFunction: function(product) {
                var license = product.license || {};
                return license.contractNumber || '';
            }
        }
    ];

}

