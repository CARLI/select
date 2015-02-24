angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableByLibraryController', productsAvailableByLibraryController);

function productsAvailableByLibraryController( $scope, $q, alertService, controllerBaseService, cycleService, libraryService, offeringService, vendorService ) {
    var vm = this;

    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.offeringDisplayLabels = offeringService.getOfferingDisplayLabels();

    vm.loadOfferingsForLibrary = loadOfferingsForLibrary;
    vm.loadingPromise = {};
    vm.offerings = {};

    vm.setOfferingEditable = setOfferingEditable;
    vm.saveOffering = saveOffering;
    vm.debounceSaveOffering = debounceSaveOffering;
    vm.getLibraryPricingStatus = getLibraryPricingStatus;
    vm.computeSelectionTotalForLibrary = computeSelectionTotalForLibrary;

    vm.offeringFilter = {};
    vm.filterOfferingBySelection = filterOfferingBySelection;

    vm.vendorMap = {};

    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';
    vm.selectedOfferings = {};

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
