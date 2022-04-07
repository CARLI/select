angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .controller('librariesSelectingProductsByLibraryController', librariesSelectingProductsByLibraryController);

function librariesSelectingProductsByLibraryController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, libraryService, libraryStatusService, offeringService, offeringsByLibraryExport, editOfferingService, productService, vendorService ) {
    var vm = this;

    accordionControllerMixin(vm, loadOfferingsForLibrary);

    vm.exportOfferingList = exportOfferingList;
    vm.filterOfferingBySelection = filterOfferingBySelection;
    vm.getLibraryPricingStatus = getLibraryPricingStatus;
    vm.stopEditing = stopEditing;

    vm.cycle = {};
    vm.isEditing = {};
    vm.lastYear = '';
    vm.libraryStatuses = {};
    vm.loadingPromise = {};
    vm.offeringFilter = {};
    vm.offerings = {};
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
    vm.vendorMap = {};

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
        vm.libraryLoadingPromise = libraryService.listActiveNonAffiliateLibraries()
            .then(function(libraryList){
                vm.libraryList = libraryList;
                return libraryList;
            })
            .then(function(){
                return libraryStatusService.getStatusesForAllLibraries(vm.cycle);
            })
            .then(function(libraryStatusMapping){
                vm.libraryStatuses = libraryStatusMapping;
                return libraryStatusMapping;
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
        var status = vm.libraryStatuses[library.id] || {};
        var statusText = 'No Activity';

        if (status.lastActivity) {
            statusText = 'In Progress';
        }
        if (status.isComplete) {
            statusText = 'Selections Complete';
        }

        return statusText;
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

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
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
