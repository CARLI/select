angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByVendorController', productsAvailableByVendorController);

function productsAvailableByVendorController( $scope, $q, $timeout, alertService, controllerBaseService, cycleService, libraryService, editOfferingService, vendorService, offeringService, productService ) {
    var vm = this;
    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.toggleVendorAccordion = toggleVendorAccordion;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.computeSelectionTotalForVendor = computeSelectionTotalForVendor;
    vm.computeInvoiceTotalForVendor = computeInvoiceTotalForVendor;
    vm.loadingPromise = {};
    vm.setOfferingEditable = setOfferingEditable;
    vm.saveOffering = saveOffering;
    vm.debounceSaveOffering = debounceSaveOffering;
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
                vm.isEditing[newOffering.id] = true;
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
            $timeout(function(){
                var stop = new Date();
                console.log('digest vendor data took '+ (stop-start)/1000 + 'ms');
            });
        });

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

    function debounceSaveOffering($event, offering, productOfferings) {
        offering.userTouchedFlag = true;
        if (vm.isEditing[offering.id]) {
            return;
        }
        if ($event.target.tagName === 'INPUT') {
            saveOffering( offering, productOfferings );
        }
    }

    function saveOffering( offering, productOfferings ) {
        if (offering.libraryComments === offering.product.comments) {
            delete offering.libraryComments;
        }
        if (!offering.userTouchedFlag) {
            delete offering.flagged;
        }
        delete offering.userTouchedFlag;

        offeringService.update(offering)
            .then(offeringService.load)
            .then(updateOfferingFlaggedStatus)
            .then(function(updatedOffering){
                var offeringIndex = productOfferings.indexOf(offering);
                productOfferings[offeringIndex] = updatedOffering;
                alertService.putAlert('Offering updated', {severity: 'success'});
                updateVendorTotals();
                vm.onOfferingSaved();
                vm.isEditing[offering.id] = false;
            }).catch(function(err) {
                alertService.putAlert(err, {severity: 'danger'});
                console.log('failed', err);
            });
    }

    function updateOfferingFlaggedStatus( offering ){
        offering.flagged = offering.getFlaggedState();
        return offering;
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
