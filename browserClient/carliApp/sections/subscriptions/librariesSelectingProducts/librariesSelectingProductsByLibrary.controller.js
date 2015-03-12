angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .controller('librariesSelectingProductsByLibraryController', librariesSelectingProductsByLibraryController);

function librariesSelectingProductsByLibraryController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, libraryService, offeringService, editOfferingService, vendorService ) {
    var vm = this;

    accordionControllerMixin(vm, loadOfferingsForLibrary);

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

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }
}
