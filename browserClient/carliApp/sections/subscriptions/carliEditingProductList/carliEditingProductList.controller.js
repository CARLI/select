angular.module('carli.sections.subscriptions.carliEditingProductList')
    .controller('carliEditingProductListController', carliEditingProductListController);

function carliEditingProductListController( $scope, alertService, cycleService, productService, vendorService ) {
    var vm = this;
    vm.removeProduct = removeProduct;
    vm.openVendorPricing = openVendorPricing;
    vm.loadProductsForVendor = loadProductsForVendor;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.loadingPromise = {};
    activate();

    function activate () {
        vm.cycle = cycleService.getCurrentCycle();

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
        productService.listProductCountsByVendorId()
            .then(function( productsByVendorId ){
                return Object.keys(productsByVendorId);
            })
            .then(vendorService.getVendorsById)
            .then(filterActiveVendors)
            .then(function (vendors) {
                vm.vendors = vendors;
            });
    }

    function filterActiveVendors(vendorList){
        return vendorList.filter(vendorIsActive);

        function vendorIsActive(vendor){
            return vendor.isActive;
        }
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return;
        }
        vm.loadingPromise[vendor.id] = productService.listActiveProductsForVendorId(vendor.id)
            .then(function (products) {
                return $q.all( products.map(loadSelectionHistory) )
                    .then(function(){
                        vendor.products = products;
                        return products;
                    });
/*
                    product.selectionHistory = {};
                    for (var i = 0; i < vm.yearsToDisplay.length; i++) {
                        var y = vm.yearsToDisplay[i];
                        product.selectionHistory[y] = _pickRandomSelectionHistory();
                        product.lastPrice = '$123,456';
                    }
*/
        });

        function loadSelectionHistory( product ){
            //TODO: pull the logic out of subscriptionHistoryTable.controller.js into a service and share it here
            //the logic to load the last four cycles and return a list of stats
            //that controller and this one need slightly different shapes though.
        }
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
        product.cycle = vm.cycle;

        return productService.update( product).then( function(){
            alertService.putAlert('Product Removed', {severity: 'success'});
        })
        .then(function syncData(){
            return cycleService.syncDataToVendorDatabase( product.vendor.id, vm.cycle );
        });
    }

    function openVendorPricing(){
        return vm.cycleRouter.next();
    }
}
