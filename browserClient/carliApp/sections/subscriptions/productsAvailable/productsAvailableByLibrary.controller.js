angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByLibraryController', productsAvailableByLibraryController);

function productsAvailableByLibraryController( $scope, $q, controllerBaseService, cycleService, libraryService, offeringService, editOfferingService, vendorService ) {
    var vm = this;

    vm.loadOfferingsForLibrary = loadOfferingsForLibrary;
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
    vm.offeringColumns = [
        'product',
        'selected-last-year',
        'vendor',
        'library-view',
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
            return $q.when(vm.offerings[library.id]);
        }

        vm.loadingPromise[library.id] = offeringService.listOfferingsForLibraryId(library.id)
            .then(function(offeringsForLibrary){
                vm.offerings[library.id] = offeringsForLibrary;

                offeringsForLibrary.forEach(function(offering){
                    offering.product.vendor = vm.vendorMap[offering.product.vendor];
                    offering.display = offering.display || "with-price";

                    updateOfferingFlaggedStatus(offering);

                    if (!offering.libraryComments) {
                        offering.libraryComments = offering.product.comments;
                    }
                });

                return offeringsForLibrary;
            });

        return vm.loadingPromise[library.id];
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

    function updateOfferingFlaggedStatus( offering ){
        offering.flagged = offering.getFlaggedState();
        return offering;
    }

    function invoiceCheckedProductsForLibrary( library ){
        if ( !library || !vm.selectedOfferings[library.id] ){
            return;
        }

        var offeringsToInvoice = Object.keys(vm.selectedOfferings[library.id]).filter(function(key){
            return vm.selectedOfferings[library.id][key];
        });

        alert('invoice offerings '+offeringsToInvoice.join(','));
    }
}
