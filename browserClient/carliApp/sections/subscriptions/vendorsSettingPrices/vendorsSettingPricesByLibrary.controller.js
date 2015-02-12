angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByLibraryController', vendorsSettingPricesByLibraryController);

function vendorsSettingPricesByLibraryController( $scope, $q, alertService, cycleService, libraryService, offeringService, vendorService ) {
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
        initSortable();

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

    function initSortable() {
        vm.orderBy = vm.orderBy || 'product.name';
        vm.reverse = false;

        vm.sort = function sort( newOrderBy ){
            if ( !newOrderBy ){
                return;
            }

            if ( vm.orderBy === newOrderBy){
                vm.reverse = !vm.reverse;
            }
            else {
                vm.orderBy = newOrderBy;
                vm.reverse = false;
            }
        };
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
                    offering.flagged = offering.getFlaggedState();
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
        if ($event.target.tagName === 'INPUT') {
            saveOffering( offering, libraryId );
        }
    }

    function saveOffering( offering, libraryId ) {
        console.log('saveOffering('+offering.id+','+libraryId);

        if (offering.libraryComments === offering.product.comments) {
            delete offering.libraryComments;
        }
        offeringService.update(offering)
            .then(offeringService.load)
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
}
