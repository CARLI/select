angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByVendorController', productsAvailableByVendorController);

function productsAvailableByVendorController( $scope, $q, accordionControllerMixin, $timeout, controllerBaseService, cycleService, vendorService, offeringService, editOfferingService,  productService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

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
        $scope.$watch(editOfferingService.receiveOfferingEditableMessage, receiveOfferingEditableMessage);

        function receiveOfferingEditableMessage(newOffering, oldOffering) {
            if (newOffering) {
                setOfferingEditable(newOffering);
                editOfferingService.acknowledgeOfferingMadeEditable();
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
            updateVendorTotals();
            return $q.when();
        }

        vm.loadingPromise[vendor.id] = productService.listProductsWithOfferingsForVendorId(vendor.id)
            .then(function(products) {
                vendor.products = products;
                return products;
            });

        vm.loadingPromise[vendor.id].then(updateVendorTotals);
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
