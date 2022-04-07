angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByLibraryController', vendorsSettingPricesByLibraryController);

function vendorsSettingPricesByLibraryController( $scope, $q, accordionControllerMixin, controllerBaseService, cycleService, libraryService, offeringService, offeringsByLibraryExport, editOfferingService, productService, vendorService ) {
    var vm = this;

    accordionControllerMixin(vm, loadOfferingsForLibrary);

    vm.exportOfferingList = exportOfferingList;
    vm.stopEditing = stopEditing;

    vm.cycle = {};
    vm.isEditing = {};
    vm.lastYear = '';
    vm.loadingPromise = {};
    vm.offerings = {};
    vm.offeringColumns = [
        'product',
        'vendor',
        'library-view',
        'site-license-price-both',
        'flag'
    ];
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

    function exportOfferingList(library) {
        return offeringsByLibraryExport(library, vm.vendorMap, vm.offerings[library.id], vm.cycle, vm.offeringColumns);
    }
}
