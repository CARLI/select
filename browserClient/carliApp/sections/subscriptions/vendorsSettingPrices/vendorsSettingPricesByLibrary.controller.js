angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByLibraryController', vendorsSettingPricesByLibraryController);

function vendorsSettingPricesByLibraryController( $scope, $q, controllerBaseService, cycleService, libraryService, offeringService, editOfferingService, vendorService ) {
    var vm = this;

    vm.toggleLibraryAccordion = toggleLibraryAccordion;
    vm.loadingPromise = {};
    vm.offerings = {};
    vm.stopEditing = stopEditing;
    vm.vendorMap = {};
    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.offeringColumns = [
        'product',
        'vendor',
        'library-view',
        'site-license-price',
        'flag'
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

    function toggleLibraryAccordion( library ){
        if ( vm.openAccordion !== library.id ){
            loadOfferingsForLibrary(library)
                .then(function () {
                    vm.openAccordion = library.id;
                });
        } else {
            vm.openAccordion = null;
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
