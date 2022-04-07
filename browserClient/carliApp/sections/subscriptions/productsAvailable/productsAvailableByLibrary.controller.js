angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByLibraryController', productsAvailableByLibraryController);

function productsAvailableByLibraryController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, libraryService, notificationModalService, offeringService, offeringsByLibraryExport, editOfferingService, productService, vendorService ) {
    var vm = this;

    accordionControllerMixin(vm, loadOfferingsForLibrary);

    vm.computeSelectionTotalForLibrary = computeSelectionTotalForLibrary;
    vm.contactNonPlayers = contactNonPlayers;
    vm.estimateAllLibraries = estimateAllLibraries;
    vm.exportOfferingList = exportOfferingList;
    vm.filterOfferingBySelection = filterOfferingBySelection;
    vm.invoiceAllLibraries = invoiceAllLibraries;
    vm.invoiceAllProductsForLibrary = invoiceAllProductsForLibrary;
    vm.invoiceCheckedProductsForLibrary = invoiceCheckedProductsForLibrary;
    vm.stopEditing = stopEditing;

    vm.cycle = {};
    vm.isEditing = {};
    vm.lastYear = '';
    vm.loadingPromise = {};
    vm.offeringFilter = {};
    vm.offerings = {};
    vm.selectedOfferings = {};
    vm.vendorMap = {};

    vm.offeringColumns = [
        'product',
        'vendor',
        'library-view',
        'selected-last-year',
        'site-license-price-current-only',
        'selection'
    ];
    vm.sortOptions = {
        product: 'product.name',
        vendor: ['product.vendor.name', 'product.name'],
        selectedLastYear: [orderBySelection, 'product.name'],
        pricing: orderBySitePricing
    };

    activate();

    function activate () {
        controllerBaseService.addSortable(vm, 'product.name');

        vm.cycle = cycleService.getCurrentCycle();
        vm.lastYear = vm.cycle.year - 1;

        initVendorMap().then(initLibraryList);
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

    function initLibraryList(){
        vm.libraryLoadingPromise = libraryService.listActiveNonAffiliateLibraries().then(function(libraryList){
            vm.libraryList = libraryList;
        });
    }

    function initVendorMap(){
        return vendorService.list().then(function(vendorList){
            vendorList.forEach(function(vendor){
                vm.vendorMap[vendor.id] = vendor;
            });
            return vendorList;
        });
    }

    function filterOfferingBySelection( offering ){
        if ( !offering || !offering.library ){
            return false;
        }
        if ( vm.isEditing[offering.id] ) {
            return true;
        }
        var libraryId = typeof offering.library === 'string' ? offering.library : offering.library.id;
        var filterStatus = vm.offeringFilter[libraryId] || 'selected';

        if ( filterStatus === 'all' ){
            return true;
        }
        else if ( filterStatus === 'selected' && offering.selection ){
            return true;
        }
        else if ( filterStatus === 'unselected' && !offering.selection ){
            return true;
        }
        else {
            return false;
        }
    }

    function loadOfferingsForLibrary( library ){
        if ( vm.offerings[library.id] ){
            return $q.when();
        }

        vm.loadingPromise[library.id] = offeringService.listOfferingsForLibraryId(library.id)
            .then(attachVendorsToOfferingProducts)
            .then(filterActiveProducts)
            .then(attachOfferingsToLibrary);

        return vm.loadingPromise[library.id];


        function attachVendorsToOfferingProducts(offerings){
            return offerings.map(function(offering){
                var vendorId = offering.product.vendor;
                offering.product.vendor = vm.vendorMap[vendorId];
                return offering;
            });
        }

        function filterActiveProducts(offerings){
            return offerings.filter(function(offering){
                return productService.isProductActive(offering.product);
            });
        }

        function attachOfferingsToLibrary(offerings){
            vm.offerings[library.id] = offerings;
            return offerings;
        }
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

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
        vm.notifyParentOfSave();
    }

    function invoiceCheckedProductsForLibrary( library ){
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

    function invoiceAllLibraries() {
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-library-invoices',
            cycleId: vm.cycle.id
        });
    }

    function contactNonPlayers(){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-contact-non-players',
            cycleId: vm.cycle.id
        });
    }

    function estimateAllLibraries(){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-library-estimates-closed',
            cycleId: vm.cycle.id
        });
    }

    function orderBySelection(offering){
        return !(offering &&
        offering.history &&
        offering.history[vm.lastYear] &&
        offering.history[vm.lastYear].selection);
    }

    function orderBySitePricing(offering){
        return offering.pricing.site || 0;
    }

    function exportOfferingList(library) {
        var filteredOfferings = vm.offerings[library.id].filter(filterOfferingBySelection);
        return offeringsByLibraryExport(library, vm.vendorMap, filteredOfferings, vm.cycle, vm.offeringColumns);
    }
}
