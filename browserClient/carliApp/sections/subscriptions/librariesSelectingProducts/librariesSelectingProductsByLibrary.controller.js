angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .controller('librariesSelectingProductsByLibraryController', librariesSelectingProductsByLibraryController);

function librariesSelectingProductsByLibraryController( $scope, $q, controllerBaseService, cycleService, libraryService, offeringService, editOfferingService, vendorService ) {
    var vm = this;

    vm.toggleLibraryAccordion = toggleLibraryAccordion;
    vm.loadingPromise = {};
    vm.offerings = {};
    vm.stopEditing = stopEditing;
    vm.getLibraryPricingStatus = getLibraryPricingStatus;
    vm.offeringFilter = {};
    vm.filterOfferingBySelection = filterOfferingBySelection;
    vm.vendorMap = {};
    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
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
        $scope.$watch(getCurrentOffering, watchCurrentOffering);

        function getCurrentOffering() {
            return editOfferingService.getCurrentOffering();
        }

        function watchCurrentOffering(newOffering, oldOffering) {
            if (newOffering) {
                setOfferingEditable(newOffering);
                editOfferingService.setCurrentOffering(null);
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

    function toggleLibraryAccordion( library ){
        var userSelectedCurrentlyOpenAccordion = vm.openAccordion === library.id;

        if ( confirmCloseAccordion() ) {
            closeAccordion();

            if ( !userSelectedCurrentlyOpenAccordion ){
                loadOfferingsThenOpenAccordion();
            }
        }

        function confirmCloseAccordion() {
            if (!accordionIsOpen()) {
                return true;
            }
            if ( !formsAreDirty() ) {
                return true;
            }
            return confirm("You have unsaved changes that will be lost if you continue.");

            function accordionIsOpen() {
                return vm.openAccordion ? true : false;
            }

            function formsAreDirty() {
                return vm.anyFormsHaveUnsavedChanges();
            }
        }

        function closeAccordion() {
            vm.openAccordion = null;
        }

        function loadOfferingsThenOpenAccordion() {
            loadOfferingsForLibrary(library)
                .then(function () {
                    vm.openAccordion = library.id;
                });
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

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }
}
