angular.module('carli.sections.oneTimePurchases')
    .controller('oneTimePurchasesByLibraryController', oneTimePurchasesByLibraryController);

function oneTimePurchasesByLibraryController($scope, $q, accordionControllerMixin, config, controllerBaseService, cycleService, editOfferingService, libraryService, notificationModalService, offeringService, productService, vendorService) {
    var vm = this;

    accordionControllerMixin(vm, loadOfferingsForLibrary);
    controllerBaseService.addSortable(vm, 'product.name');

    vm.cycle = null;
    vm.isEditing = {};
    vm.libraryList = [];
    vm.libraryListLoadingPromise = null;
    vm.loadingPromise = {};
    vm.offerings = {};
    vm.offeringFilter = {};
    vm.selectedOfferings = {};
    vm.vendorMap = {};

    vm.computeSelectionTotalForLibrary = computeSelectionTotalForLibrary;
    vm.filterOfferingBySelection = filterOfferingBySelection;
    vm.invoiceAllProductsForLibrary = invoiceAllProductsForLibrary;
    vm.invoiceAnnualAccessFees = invoiceAnnualAccessFees;
    vm.invoiceCheckedProductsForLibrary = invoiceCheckedProductsForLibrary;
    vm.stopEditing = stopEditing;

    vm.offeringColumns = [
        'product',
        'vendor',
        'library-view',
        'site_license_price_only_as_price',
        'oneTimePurchaseSelection'
    ];
    vm.sortOptions = {
        product: 'product.name',
        vendor: ['product.vendor.name', 'product.name'],
        pricing: orderBySitePricing
    };

    activate();

    function activate() {
        connectEditButtons();

        vm.libraryListLoadingPromise = initControllerData();

        return vm.libraryListLoadingPromise;
    }

    function computeSelectionTotalForLibrary( library ){
        if ( !vm.offerings[library.id] ){
            return 0;
        }

        var offerings = vm.offerings[library.id];
        var sum = 0;

        offerings.forEach(function(offering){
            sum += offering.selection ? offeringService.getFundedSelectionPrice(offering) : 0;
        });

        return sum;
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

    function filterOfferingBySelection(offering) {
        if (!offering || !offering.library) {
            return false;
        }
        if (vm.isEditing[offering.id]) {
            return true;
        }
        var libraryId = typeof offering.library === 'string' ? offering.library : offering.library.id;
        var filterStatus = vm.offeringFilter[libraryId] || 'selected';

        if (filterStatus === 'all') {
            return true;
        }
        else if (filterStatus === 'selected' && offering.selection) {
            return true;
        }
        else if (filterStatus === 'unselected' && !offering.selection) {
            return true;
        }
        else {
            return false;
        }
    }

    function initControllerData() {
        return initVendorMap()
            .then(setCycleToOneTimePurchase)
            .then(initLibraryList);

        function setCycleToOneTimePurchase() {
            return cycleService.load(config.oneTimePurchaseProductsCycleDocId).then(function (oneTimePurchaseCycle) {
                vm.cycle = oneTimePurchaseCycle;
                cycleService.setCurrentCycle(oneTimePurchaseCycle);
                return oneTimePurchaseCycle;
            });
        }

        function initLibraryList() {
            return libraryService.listActiveLibraries().then(function (libraryList) {
                vm.libraryList = libraryList;
            });
        }

        function initVendorMap() {
            return vendorService.list().then(function (vendorList) {
                vendorList.forEach(function (vendor) {
                    vm.vendorMap[vendor.id] = vendor;
                });
                return vm.vendorMap;
            });
        }
    }

    function invoiceAnnualAccessFees() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-annual-access-fee-invoices'
        });
    }

    function invoiceCheckedProductsForLibrary(library) {
        if ( !library || !vm.selectedOfferings[library.id] ){
            return;
        }

        var offeringsToReport = Object.keys(vm.selectedOfferings[library.id]).filter(function(key){
            return vm.selectedOfferings[library.id][key];
        });

        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-library-invoices',
            cycleId: vm.cycle.id,
            offeringIds: offeringsToReport
        });
    }

    function invoiceAllProductsForLibrary( library ){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-library-invoices',
            cycleId: vm.cycle.id,
            recipientId: library.id
        });
    }

    function loadOfferingsForLibrary(library) {
        if (vm.offerings[library.id]) {
            return $q.when();
        }

        vm.loadingPromise[library.id] = offeringService.listOfferingsForLibraryId(library.id)
            .then(attachVendorsToOfferingProducts)
            .then(filterActiveProducts)
            .then(attachOfferingsToLibrary);

        return vm.loadingPromise[library.id];


        function attachVendorsToOfferingProducts(offerings) {
            return offerings.map(function (offering) {
                var vendorId = offering.product.vendor;
                offering.product.vendor = vm.vendorMap[vendorId];
                return offering;
            });
        }

        function filterActiveProducts(offerings) {
            return offerings.filter(function (offering) {
                return productService.isProductActive(offering.product);
            });
        }

        function attachOfferingsToLibrary(offerings) {
            vm.offerings[library.id] = offerings;
            return offerings;
        }
    }

    function orderBySitePricing(offering){
        return offering.pricing.site || 0;
    }
    
    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }

    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
        vm.notifyParentOfSave();
    }
}
