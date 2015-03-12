angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesByVendorController', carliCheckingPricesByVendorController);

function carliCheckingPricesByVendorController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, vendorService, offeringService, editOfferingService, productService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.loadingPromise = {};
    vm.stopEditing = stopEditing;
    vm.vendors = [];
    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.offeringColumns = [
        'library',
        'library-view',
        'site-license-price',
        'flag'
    ];

    activate();

    function activate () {
        controllerBaseService.addSortable(vm, 'library.name');

        vm.cycle = cycleService.getCurrentCycle();
        vm.lastYear = vm.cycle.year - 1;

        loadVendors();
        connectEditButtons();
    }

    function connectEditButtons() {
        $scope.$watch(getCurrentOffering, watchCurrentOffering);

        function getCurrentOffering() {
            return editOfferingService.getCurrentOffering();
        }

        function watchCurrentOffering(newOffering, oldOffering) {
            if (newOffering) {
                setOfferingEditable(newOffering);
                editOfferingService.setCurrentOffering(null);
            }
        }
    }

    function loadVendors() {
        vm.vendorLoadingPromise = productService.listProductCountsByVendorId()
            .then(function( productsByVendorId ){
                return Object.keys(productsByVendorId);
            })
            .then(vendorService.getVendorsById)
            .then(function (vendors) {
                vm.vendors = vendors;
            });
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return $q.when();
        }

        vm.loadingPromise[vendor.id] = productService.listProductsWithOfferingsForVendorId(vendor.id)
            .then(function(products) {
                vendor.products = products;
                return products;
            });

        return vm.loadingPromise[vendor.id];
    }

    function getVendorPricingStatus(vendor) {
        return "No activity";
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }
}
