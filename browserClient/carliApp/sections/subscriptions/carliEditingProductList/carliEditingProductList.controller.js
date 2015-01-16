angular.module('carli.sections.subscriptions.carliEditingProductList')
    .controller('carliEditingProductListController', carliEditingProductListController);

function carliEditingProductListController( $scope, alertService, productService, vendorService ) {
    var vm = this;
    vm.removeProduct = removeProduct;
    vm.openVendorPricing = openVendorPricing;
    activate();

    function activate () {
        initYearsToDisplay();
        initSortable();
        loadVendors();
    }

    function initYearsToDisplay() {
        vm.yearsToDisplay = [];
        for (var y = 2010; y < 2015; y++) {
            vm.yearsToDisplay.push(y);
        }
    }

    function initSortable() {
        vm.orderBy = vm.orderBy || 'name';
        vm.reverse = false;

        vm.sort = function sort( newOrderBy ){
            if ( !newOrderBy ){
                return;
            }

            if ( vm.orderBy === newOrderBy){
                vm.reverse = !vm.reverse;
            }
            else {
                vm.orderBy = newOrderBy;
                vm.reverse = false;
            }
        };
    }

    function loadVendors() {
        vendorService.list().then(function (vendors) {
            vm.vendors = vendors;
            angular.forEach(vendors, function (vendor) {
                loadProductsForVendor(vendor);
            });
        });
    }

    function loadProductsForVendor(vendor) {
        productService.listProductsForVendorId(vendor.id).then(function (products) {
            vendor.products = products;
            angular.forEach(products, function (product) {
                product.selectionHistory = {};
                for (var i = 0; i < vm.yearsToDisplay.length; i++) {
                    var y = vm.yearsToDisplay[i];
                    product.selectionHistory[y] = _pickRandomSelectionHistory();
                    product.lastPrice = '$123,456';
                }
            });
        });
    }
    function _pickRandomSelectionHistory() {
        switch (getRandomInt(0, 2)) {
            case 0: return 'not offered';
            case 1: return 'not selected';
            case 2: return 'selected';
        }
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function removeProduct( product ){
        product.isActive = false;
        productService.update( product).then( function(){
            alertService.putAlert('Product Removed', {severity: 'success'});
        });
    }

    function openVendorPricing(){
        $scope.cycle.proceedToNextStep();
        //TODO: persist the cycle and add a success alert when it's saved
    }
}
