angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByVendorController', productsAvailableByVendorController);

function productsAvailableByVendorController( $scope, $timeout, $q, accordionControllerMixin, notificationModalService, controllerBaseService, cycleService, vendorService, offeringService, editOfferingService,  productService ) {
    var vm = this;

    accordionControllerMixin(vm, loadProductsForVendor);

    vm.toggleProductSection = toggleProductSection;
    vm.getVendorPricingStatus = getVendorPricingStatus;
    vm.stopEditing = stopEditing;
    vm.computeSelectionTotalForVendor = computeSelectionTotalForVendor;
    vm.computeInvoiceTotalForVendor = computeInvoiceTotalForVendor;
    vm.getProductDisplayName = productService.getProductDisplayName;
    vm.loadingPromise = {};
    vm.vendors = [];
    vm.isEditing = {};
    vm.expandedProducts = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.selectedOfferings = {};
    vm.reportCheckedProductsForVendor = reportCheckedProductsForVendor;
    vm.reportAllProductsForVendor = reportAllProductsForVendor;
    vm.reportAllVendors = reportAllVendors;
    vm.offeringColumns = [
        'library',
        'library-view',
        'selected-last-year',
        'site-license-price-current-only',
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
            .then(filterActiveVendors)
            .then(function (vendors) {
                vm.vendors = vendors;
            });
    }

    function filterActiveVendors(vendorList){
        return vendorList.filter(vendorIsActive);

        function vendorIsActive(vendor){
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

        vm.loadingPromise[product.id] = offeringService.listOfferingsForProductId(product.id)
            .then(filterActiveLibraries)
            .then(function(offerings){
                product.offerings = offerings;
                return offerings;
            });

        return vm.loadingPromise[product.id];
    }

    function filterActiveLibraries(offeringsList){
        return offeringsList.filter(function(offering){
            return offering.library.isActive;
        });
    }

    function toggleProductSection(product){
        if ( vm.expandedProducts[product.id] ){
            delete vm.expandedProducts[product.id];
        }
        else {
            loadOfferingsForProduct(product).then(function(){
                vm.expandedProducts[product.id] = true;
            });
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

        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-vendor-reports',
            cycleId: vm.cycle.id,
            recipientId: vendor.id,
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
            console.log('digest ' + numberOfOfferings + ' vendor offerings took '+ (stop-startTime)/1000 + 's');
        });
    }
}
