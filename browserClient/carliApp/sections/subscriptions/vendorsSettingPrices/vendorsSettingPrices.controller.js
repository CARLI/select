angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( $scope, alertService, vendorService, offeringService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.vendors = [];

    activate();

    function activate () {
        initSortable();
        loadOfferings();
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

    function loadOfferings() {
        offeringService.list().then(function (offerings) {
            var productsByVendor = {};
            var offeringsByProduct = {};

            offerings.forEach(function(offering) {
                var vendorId = offering.product.vendor;
                var productId = offering.product.id;

                productsByVendor[vendorId] = productsByVendor[vendorId] || {};
                offeringsByProduct[productId] = offeringsByProduct[productId] || [];

                productsByVendor[vendorId][offering.product.id] = offering.product;
                offeringsByProduct[productId].push(offering);
            });

            for (var vendorId in productsByVendor) {
                for (var productId in offeringsByProduct) {
                    productsByVendor[vendorId][productId].offerings = offeringsByProduct[productId];
                }
                vm.vendors.push({
                    id: vendorId,
                    name: "Who knows",
                    products: objectToArray(productsByVendor[vendorId])
                });
            }
        });
    }

    function objectToArray(obj) {
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    }
    /*
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

            //generate fake offerings data
            angular.forEach(products, function (product) {
                mockupOfferingsForLibraries( product );
            });
        });
    }

    function mockupOfferingsForLibraries( product ){
        product.offerings = [];

        libraryService.list().then(function(libraryList){
            angular.forEach(libraryList, function (library) {
                product.offerings.push(
                    {
                        library: library,
                        display: "with-price",
                        internalComments: "",
                        pricing: {
                            site: 1000,
                            su: {
                                1: 500,
                                2: 1000,
                                4: 2000
                            }
                        }
                    }
                );
            });
        });
    }
    */

    function closeVendorPricing(){
        $scope.cycle.returnToPreviousStep();
        //TODO: persist the cycle and add a success alert when it's saved
    }
}
