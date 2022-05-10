angular.module('carli.sections.products')
.controller('productsController', productController);

function productController($location, $routeParams, $scope, $sce, cycleService, productService, userService ){
    var vm = this;
    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.activeCycles = [];
    vm.afterProductSubmit = newProductSubmitted;
    vm.cycleId = $routeParams.cycleId;
    vm.newProduct = newProduct();

    activate();

    function activate() {
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
        populateProductList();
    }

    function watchCurrentCycle() {
        $scope.$watch(cycleService.getCurrentCycle, function (newCycle) {
            if (newCycle) {
                routeToCycle(newCycle.id);
            }
        });
    }

    function routeToADefaultCycle(){
        var currentCycle = cycleService.getCurrentCycle();

        if ( currentCycle ){
            //Logger.log('  route to current cycle '+currentCycle.name);
            var cycleId = currentCycle.id;
            routeToCycle(cycleId);
        }
        else {
            return cycleService.listActiveCycles()
                .then(function (activeCycles) {
                    var cycleId = activeCycles[0].id;
                    //Logger.log('  route to default cycle ' + cycleId);
                    routeToCycle(cycleId);
                });
        }
    }

    function routeToCycle(cycleId){
        $location.path('/product/' + cycleId);
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
                var vendor = product.vendor;
                if (vendor && vendor.name) {
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
                var license = product.license;
                if (license && license.name) {
                    return $sce.trustAsHtml('<a href="license/' + license.id + '">' + license.name || '' + '</a>');
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

