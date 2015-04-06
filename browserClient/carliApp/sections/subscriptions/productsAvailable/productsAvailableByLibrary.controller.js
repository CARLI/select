angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByLibraryController', productsAvailableByLibraryController);

function productsAvailableByLibraryController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, libraryService, notificationModalService, offeringService, editOfferingService, vendorService ) {
    var vm = this;

    accordionControllerMixin(vm, loadOfferingsForLibrary);

    vm.loadingPromise = {};
    vm.offerings = {};
    vm.stopEditing = stopEditing;
    vm.getLibraryPricingStatus = getLibraryPricingStatus;
    vm.computeSelectionTotalForLibrary = computeSelectionTotalForLibrary;
    vm.offeringFilter = {};
    vm.filterOfferingBySelection = filterOfferingBySelection;
    vm.vendorMap = {};
    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.selectedOfferings = {};
    vm.invoiceCheckedProductsForLibrary = invoiceCheckedProductsForLibrary;
    vm.invoiceAllProductsForLibrary = invoiceAllProductsForLibrary;
    vm.invoiceAllLibraries = invoiceAllLibraries;
    vm.contactNonPlayers = contactNonPlayers;
    vm.estimateAllLibraries = estimateAllLibraries;

    vm.offeringColumns = [
        'product',
        'vendor',
        'library-view',
        'selected-last-year',
        'site-license-price',
        'selection'
    ];

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
        vm.libraryLoadingPromise = libraryService.list().then(function(libraryList){
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

    function getLibraryPricingStatus(library) {
        return "No activity";
    }

    function filterOfferingBySelection( offering ){
        if ( !offering || !offering.library ){
            return false;
        }
        var libraryId = typeof offering.library === 'string' ? offering.library : offering.library.id;
        var filterStatus = vm.offeringFilter[libraryId] || 'all';

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
            .then(attachOfferingsToLibrary);

        return vm.loadingPromise[library.id];


        function attachOfferingsToLibrary(offerings){
            vm.offerings[library.id] = offerings;
            offerings.forEach(attachProductVendorToOffering);
            return offerings;
        }

        function attachProductVendorToOffering(offering){
            var vendorId = offering.product.vendor;
            offering.product.vendor = vm.vendorMap[vendorId];
            return offering;
        }
    }

    function computeSelectionTotalForLibrary( library ){
        if ( !vm.offerings[library.id] ){
            return 0;
        }

        var offerings = vm.offerings[library.id];
        var sum = 0;

        offerings.forEach(function(offering){
            sum += offering.selection ? offering.selection.price : 0;
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
}
