angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByVendorController', productsAvailableByVendorController);

function productsAvailableByVendorController( $scope, $q, $timeout, controllerBaseService, cycleService, vendorService, offeringService, editOfferingService,  productService ) {
    var vm = this;

    vm.toggleVendorAccordion = toggleVendorAccordion;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.stopEditing = stopEditing;
    vm.computeSelectionTotalForVendor = computeSelectionTotalForVendor;
    vm.computeInvoiceTotalForVendor = computeInvoiceTotalForVendor;
    vm.loadingPromise = {};
    vm.vendors = [];
    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.selectedOfferings = {};
    vm.reportCheckedProductsForVendor = reportCheckedProductsForVendor;
    vm.offeringColumns = [
        'library',
        'library-view',
        'selected-last-year',
        'site-license-price',
        'selection',
        'vendor-invoice'
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

    function toggleVendorAccordion( vendor ){
        if ( vm.openAccordion !== vendor.id ){
            loadProductsForVendor(vendor)
                .then(updateVendorTotals)
                .then(function () {
                    vm.openAccordion = vendor.id;
                });
        } else {
            vm.openAccordion = null;
        }
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return $q.when();
        }

        var start = new Date();

        vm.loadingPromise[vendor.id] = productService.listProductsWithOfferingsForVendorId(vendor.id).then(function(products) {
            vendor.products = products;
            return products;
        }).then(logLoadTime);

        function logLoadTime(products) {
            if ( !products || !products.length ){
                return;
            }

            var numberOfOfferings = products.map(function(list){
                return list.offerings.length;
            }).reduce(function(previousValue, currentValue, index, array) {
                return previousValue + currentValue;
            });

            $timeout(function(){
                var stop = new Date();
                console.log('digest ' + numberOfOfferings + ' vendor offerings took '+ (stop-start)/1000 + 's');
            });
        }

        return vm.loadingPromise[vendor.id];
    }

    function getVendorPricingStatus(vendor) {
        return "No activity";
    }

    function updateVendorTotals() {
        vm.selectionTotal = {};
        vm.invoiceTotal = {};

        vm.vendors.forEach(function (vendor) {
            vm.selectionTotal[vendor.id] = computeSelectionTotalForVendor(vendor);
            vm.invoiceTotal[vendor.id] = computeInvoiceTotalForVendor(vendor);
        });
    }

    function computeSelectionTotalForVendor( vendor ){
        if ( !vendor.products ){
            return 0;
        }

        var sum = 0;
        var products = vendor.products;
        products.forEach(function(product){
            var offerings = product.offerings || [];

            offerings.forEach(function(offering){
                sum += offering.selection ? offering.selection.price : 0;
            });
        });

        return sum;
    }

    function computeInvoiceTotalForVendor( vendor ){
        if ( !vendor.products ){
            return 0;
        }

        var sum = 0;
        var products = vendor.products;
        products.forEach(function(product){
            var offerings = product.offerings || [];

            offerings.forEach(function(offering){
                if (offering.invoice) {
                    sum += offering.invoice.price ? offering.invoice.price : 0;
                }
            });
        });

        return sum;
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
        updateVendorTotals();
        vm.notifyParentOfSave();
    }

    function reportCheckedProductsForVendor( vendor ){
        if ( !vendor || !vm.selectedOfferings[vendor.id] ){
            return;
        }

        var offeringsToReport = Object.keys(vm.selectedOfferings[vendor.id]).filter(function(key){
            return vm.selectedOfferings[vendor.id][key];
        });

        alert('report offerings '+offeringsToReport.join(','));
    }
}
