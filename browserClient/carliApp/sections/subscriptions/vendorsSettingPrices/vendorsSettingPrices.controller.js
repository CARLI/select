angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( $scope, alertService, libraryService, productService, vendorService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;
    vm.offeringDisplayOptions = [
        {
            label: 'Display with price',
            value: 'with-price'
        },
        {
            label: 'Display without price',
            value: 'without-price'
        },
        {
            label: 'Do not display',
            value: 'none'
        }
    ];
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

    function closeVendorPricing(){
        $scope.cycle.returnToPreviousStep();
        //TODO: persist the cycle and add a success alert when it's saved
    }
}
