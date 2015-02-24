angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesByLibraryController', carliCheckingPricesByLibraryController);

function carliCheckingPricesByLibraryController( $scope, $q, alertService, controllerBaseService, cycleService, libraryService, offeringService, vendorService ) {
    var vm = this;

    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.offeringDisplayLabels = offeringService.getOfferingDisplayLabels();

    vm.loadOfferingsForLibrary = loadOfferingsForLibrary;
    vm.loadingPromise = {};
    vm.offerings = {};

    vm.setOfferingEditable = setOfferingEditable;
    vm.saveOffering = saveOffering;
    vm.debounceSaveOffering = debounceSaveOffering;

    vm.vendorMap = {};

    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';

    activate();

    function activate () {
        controllerBaseService.addSortable(vm, 'product.name');

        vm.cycle = cycleService.getCurrentCycle();
        vm.lastYear = vm.cycle.year - 1;

        initVendorMap().then(initLibraryList);
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

    function debounceSaveOffering($event, offering, libraryId) {
        offering.userTouchedFlag = true;
        if (vm.isEditing[offering.id]) {
            return;
        }
        if ($event.target.tagName === 'INPUT') {
            saveOffering( offering, libraryId );
        }
    }

    function saveOffering( offering, libraryId ) {
        if (offering.libraryComments === offering.product.comments) {
            delete offering.libraryComments;
        }
        if (!offering.userTouchedFlag) {
            delete offering.flagged;
        }
        delete offering.userTouchedFlag;

        offeringService.update(offering)
            .then(offeringService.load)
            .then(updateOfferingFlaggedStatus)
            .then(function(updatedOffering){
                var offeringIndex = vm.offerings[libraryId].indexOf(offering);
                vm.offerings[libraryId][offeringIndex] = updatedOffering;
                alertService.putAlert('Offering updated', {severity: 'success'});
                vm.isEditing[offering.id] = false;
            }).catch(function(err) {
                alertService.putAlert(err, {severity: 'danger'});
                console.log('failed', err);
            });
    }

    function updateOfferingFlaggedStatus( offering ){
        offering.flagged = offering.getFlaggedState();
        return offering;
    }
}
