angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByVendorController', productsAvailableByVendorController);

function productsAvailableByVendorController( $scope, $timeout, $q, accordionControllerMixin, notificationModalService, controllerBaseService, cycleService, vendorService, libraryService, offeringService, offeringsByVendorExport, editOfferingService,  productService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

    vm.computeInvoiceTotalForVendor = computeInvoiceTotalForVendor;
    vm.computeSelectionTotalForVendor = computeSelectionTotalForVendor;
    vm.exportOfferingList = exportOfferingList;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.reportAllProductsForVendor = reportAllProductsForVendor;
    vm.reportAllVendors = reportAllVendors;
    vm.reportCheckedProductsForVendor = reportCheckedProductsForVendor;
    vm.stopEditing = stopEditing;
    vm.toggleProductSection = toggleProductSection;

    vm.cycle = {};
    vm.expandedProducts = {};
    vm.isEditing = {};
    vm.lastYear = '';
    vm.loadingPromise = {};
    vm.offeringColumns = [
        'library',
        'library-view',
        'selected-last-year',
        'site-license-price-current-only',
        'selection',
        'vendor-invoice'
    ];
    vm.selectedOfferings = {};
    vm.vendors = [];

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
            .then(filterActiveVendors)
            .then(function (vendors) {
                vm.vendors = vendors;
            });
    }

    function filterActiveVendors(vendorList){
        return vendorList.filter(vendorIsActive);

        function vendorIsActive(vendor){
            // Added a guard to allow list of vendors to still display
            // even if faulty data somehow entered the database
            if (typeof vendor === 'undefined')
                return false;
            return vendor.isActive;
        }
    }

    function loadProductsForVendor(vendor) {
        if (vendor.products) {
            return $q.when(vendor.products);
        }

        vm.loadingPromise[vendor.id] = productService.listActiveProductsForVendorId(vendor.id)
            .then(function(products) {
                vendor.products = products;
                return products;
            });

        return vm.loadingPromise[vendor.id];
    }

    function loadOfferingsForProduct(product){
        if ( product.offerings ){
            return $q.when(product.offerings);
        }

        return offeringService.listOfferingsForProductId(product.id)
            .then(filterOfferingsWithInactiveLibraries)
            .then(fillInNonCrmFields)
            .then(function(offerings){
                product.offerings = offerings;
                return offerings;
            });
    }

    function filterOfferingsWithInactiveLibraries(offeringsList){
        return offeringsList.filter(function(offering){
            return offering.library.isActive;
        });
    }

    function fillInNonCrmFields(offerings) {
        return offeringService.populateNonCrmLibraryData(offerings, libraryService.listActiveLibraries());
    }

    function toggleProductSection(product){
        if ( vm.expandedProducts[product.id] ){
            delete vm.expandedProducts[product.id];
        }
        else {
            var loadingPromise = loadOfferingsForProduct(product).then(function(){
                vm.expandedProducts[product.id] = true;
            });
            vm.loadingPromise[product.id] = loadingPromise;
        }
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
                sum += offering.selection ? offeringService.getFullSelectionPrice(offering) : 0;
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

        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id,
            offeringIds: offeringsToReport
        });
    }

    function reportAllProductsForVendor( vendor ){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id,
            recipientId: vendor.id
        });
    }

    function reportAllVendors() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id
        });
    }


    function logLoadTime(products, startTime) {
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
            Logger.log('digest ' + numberOfOfferings + ' vendor offerings took '+ (stop-startTime)/1000 + 's');
        });
    }

    function exportOfferingList(vendor) {
        return loadOfferingsForVendor().then(function() {
            return offeringsByVendorExport(vendor, vm.cycle, vm.offeringColumns);
        });

        function loadOfferingsForVendor() {
            return $q.all(vendor.products.map(loadOfferingsForProduct));
        }
    }
}
