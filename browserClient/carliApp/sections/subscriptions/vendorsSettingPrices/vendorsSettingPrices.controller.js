angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( $scope, alertService, vendorService, offeringService, productService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.loadProductsForVendor = loadProductsForVendor;
    vm.vendors = [];

    activate();

    function activate () {
        initSortable();
        loadVendors();
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
            //angular.forEach(vendors, function (vendor) {
            //    loadProductsForVendor(vendor);
            //});
        });
    }

    function loadProductsForVendor(vendor) {
        productService.listProductsForVendorId(vendor.id).then(function (products) {
            vendor.products = products;

            angular.forEach(products, function (product) {
                offeringService.listOfferingsForProductId(product.id).then(function(offerings) {
                    product.offerings = offerings;
                });
            });
        });
    }

    function closeVendorPricing(){
        $scope.cycle.returnToPreviousStep();
        //TODO: persist the cycle and add a success alert when it's saved
    }
}
