angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByLibraryController', vendorsSettingPricesByLibraryController);

function vendorsSettingPricesByLibraryController( $scope, controllerBaseService, cycleService, libraryService, offeringService, editOfferingService, vendorService ) {
    var vm = this;

    vm.loadOfferingsForLibrary = loadOfferingsForLibrary;
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

    function loadOfferingsForLibrary( library ){
        if ( vm.offerings[library.id] ){
            return;
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
            });
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }
    function stopEditing(offering) {
        vm.isEditing[offering.id] = false;
    }

    function updateOfferingFlaggedStatus( offering ){
        offering.flagged = offeringService.getFlaggedState(offering);
        return offering;
    }
}
