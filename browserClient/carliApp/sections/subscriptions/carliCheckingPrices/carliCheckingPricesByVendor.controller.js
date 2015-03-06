angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesByVendorController', carliCheckingPricesByVendorController);

function carliCheckingPricesByVendorController( $scope, $q, controllerBaseService, cycleService, vendorService, offeringService, editOfferingService, productService ) {
    var vm = this;

    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.offeringDisplayLabels = offeringService.getOfferingDisplayLabels();
    vm.loadProductsForVendor = loadProductsForVendor;
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
            return;
        }
        vm.loadingPromise[vendor.id] = productService.listProductsForVendorId(vendor.id).then(function (products) {
            vendor.products = products;

            var promises = [];
            angular.forEach(products, function (product) {
                var offeringPromise = offeringService.listOfferingsForProductId(product.id).then(function(offerings) {
                    product.offerings = offerings;

                    offerings.forEach(function(offering){
                        offering.display = offering.display || "with-price";

                        updateOfferingFlaggedStatus(offering);

                        if (!offering.libraryComments) {
                            offering.libraryComments = offering.product.comments;
                        }
                    });
                    return offerings;
                });
                promises.push(offeringPromise);
            });
            return $q.all(promises);
        });
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

    function updateOfferingFlaggedStatus( offering ){
        offering.flagged = offering.getFlaggedState();
        return offering;
    }
}
