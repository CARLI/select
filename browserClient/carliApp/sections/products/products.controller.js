angular.module('carli.sections.products')
.controller('productsController', productController);

function productController($location, $routeParams, $scope, $sce, cycleService, productService ){
    var vm = this;
    vm.activeCycles = [];
    vm.afterProductSubmit = newProductSubmitted;
    vm.cycleId = $routeParams.cycleId;
    vm.newProduct = newProduct();

    activate();

    function activate() {
        console.log('Products list page activate: cycleId = '+vm.cycleId);

        cycleService.listActiveCycles().then(function(activeCycles) {
            vm.activeCycles = activeCycles;
        });

        watchCurrentCycle();

        if ( vm.cycleId ){
            cycleService.load(vm.cycleId)
                .then(function(cycle){
                    cycleService.setCurrentCycle(cycle);
                    completeActivation(cycle);
                });
        }
        else {
            routeToADefaultCycle();
        }
    }

    function completeActivation(cycle){
        vm.newProduct = newProduct(cycle);
    }

    function watchCurrentCycle() {
        $scope.$watch(cycleService.getCurrentCycle, function (newValue) {
            if (newValue) {
                populateProductList();
            }
        });
    }

    function routeToADefaultCycle(){
        var currentCycle = cycleService.getCurrentCycle();

        if ( currentCycle ){
            console.log('  route to current cycle '+currentCycle.name);
            $location.path('/product/'+currentCycle.id);
        }
        else {
            return cycleService.listActiveCycles()
                .then(function (activeCycles) {
                    var cycleId = activeCycles[0].id;
                    console.log('  route to default cycle ' + cycleId);
                    $location.path('/product/' + cycleId);
                });
        }
    }

    function newProductSubmitted() {
        vm.newProduct = newProduct();
        populateProductList();
    }

    function populateProductList() {
        vm.loadingPromise = productService.list().then( function(productList){
            vm.productList = productList;
        });
    }

    function newProduct(cycle){
        return {
            type: 'Product',
            cycle: cycle || cycleService.getCurrentCycle(),
            isActive: true,
            contacts: [],
            futurePriceCaps: {}
        };
    }

    vm.productListColumns = [
        {
            label: "Product Name",
            orderByProperty: 'name',
            contentFunction: function(product) {
                return $sce.trustAsHtml('<a href="product/' + vm.cycleId + '/' + product.id + '">' + productService.getProductDisplayName(product) + '</a>');
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

