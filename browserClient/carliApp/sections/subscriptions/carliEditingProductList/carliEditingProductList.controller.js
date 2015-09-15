angular.module('carli.sections.subscriptions.carliEditingProductList')
    .controller('carliEditingProductListController', carliEditingProductListController);

function carliEditingProductListController( $filter, $q, alertService, cycleService, historicalPricingService, productService, vendorService, vendorStatusService ) {
    var vm = this;

    vm.loadingPromise = {};
    vm.vendorStatus = {};

    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.loadProductsForVendor = loadProductsForVendor;
    vm.openVendorPricing = openVendorPricing;
    vm.removeProduct = removeProduct;
    vm.saveReviewStatus = saveReviewStatus;
    vm.clearReviewStatus = clearReviewStatus;

    activate();

    function activate () {
        vm.cycle = cycleService.getCurrentCycle();

        initYearsToDisplay();
        initSortable();
        loadVendors();
    }

    function initYearsToDisplay() {
        vm.yearsToDisplay = [];
        var maxYear = vm.cycle.year;
        var minYear = maxYear - 4;

        for (var y = minYear; y <= maxYear ; y++) {
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
            })
            .then(loadVendorStatuses);
    }

    function filterActiveVendors(vendorList){
        return vendorList.filter(vendorIsActive);

        function vendorIsActive(vendor){
            return vendor.isActive;
        }
    }

    function loadVendorStatuses(){
        vm.vendorStatus = {};

        return vendorStatusService.list(vm.cycle)
            .then(function(vendorStatusList){
                vendorStatusList.forEach(function(vendorStatus){
                    vm.vendorStatus[vendorStatus.vendor] = vendorStatus;
                });
                return vm.vendorStatus;
            });
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
        });

        function loadSelectionHistory( product ){
            return historicalPricingService.getHistoricalPricingDataForProduct(product.id, vm.cycle)
                .then(function(historicalPricingData){
                    product.historicalPricing = historicalPricingData;
                    product.pricingLastYear = pricingForLastYear(historicalPricingData);
                });
        }
    }


    function pricingForLastYear(historicalPricingData){
        var thisYear = vm.cycle.year;
        var lastYear = thisYear - 1;
        var pricingData = historicalPricingData.filter(dataIsForLastYear)[0] || {};

        var currency = $filter('currency');

        if ( pricingData.minPrice && pricingData.maxPrice ){
            if ( pricingData.minPrice === pricingData.maxPrice ){
                return currency(pricingData.maxPrice);
            }
            else {
                return currency(pricingData.minPrice) + ' - ' + currency(pricingData.maxPrice);
            }
        }
        else {
            return '-';
        }

        function dataIsForLastYear(pricingData){
            return pricingData.year == lastYear;
        }
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

    function saveReviewStatus( vendor ){
        if ( !vendor ) {
            return;
        }

        return vendorStatusService.markProductsForVendorReviewed(vendor.id, vm.cycle)
            .then(updateVendorStatus(vendor.id));
    }

    function clearReviewStatus( vendor ){
        if ( !vendor ) {
            return;
        }

        return vendorStatusService.clearProductsForVendorReviewed(vendor.id, vm.cycle)
            .then(updateVendorStatus(vendor.id));
    }

    function updateVendorStatus(vendorId){
        return function(vendorStatusId) {
            return vendorStatusService.load(vendorStatusId, vm.cycle)
                .then(function (updatedVendorStatus) {
                    vm.vendorStatus[vendorId] = updatedVendorStatus;
                });
        }
    }

    function openVendorPricing(){
        return vm.cycleRouter.next();
    }
}
