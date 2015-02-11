angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesByLibraryController', vendorsSettingPricesByLibraryController);

function vendorsSettingPricesByLibraryController( $scope, $q, alertService, cycleService, libraryService, offeringService ) {
    var vm = this;

    vm.offeringDisplayOptions = offeringService.getOfferingDisplayOptions();
    vm.offeringDisplayLabels = offeringService.getOfferingDisplayLabels();

    vm.loadOfferingsForLibrary = loadOfferingsForLibrary;
    vm.loadingPromise = {};
    vm.offerings = {};

    vm.setOfferingEditable = setOfferingEditable;
    vm.saveOffering = saveOffering;
    vm.debounceSaveOffering = debounceSaveOffering;

    vm.isEditing = {};
    vm.cycle = {};
    vm.lastYear = '';

    activate();

    function activate () {
        console.log('vendorsSettingPricesByLibraryController activate');

        initSortable();

        vm.cycle = cycleService.getCurrentCycle();
        vm.lastYear = vm.cycle.year - 1;

        initLibraryList();
    }

    function initLibraryList(){
        console.log('initLibraryList');
        libraryService.list().then(function(libraryList){
            console.log(libraryList);
            vm.libraryList = libraryList;
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
            });
    }

    function setOfferingEditable( offering ){
        vm.isEditing[offering.id] = true;
    }

    function debounceSaveOffering($event, offering, libraryId, offeringIndex) {
        if ($event.target.tagName === 'INPUT') {
            saveOffering( offering, libraryId, offeringIndex );
        }
    }

    function saveOffering( offering, libraryId, offeringIndex ) {
        if (offering.libraryComments === offering.product.comments) {
            delete offering.libraryComments;
        }
        offeringService.update(offering)
            .then(offeringService.load)
            .then(function(updatedOffering){
                vm.offerings[libraryId][offeringIndex] = updatedOffering;
                alertService.putAlert('Offering updated', {severity: 'success'});
                vm.isEditing[offering.id] = false;
            }).catch(function(err) {
                alertService.putAlert(err, {severity: 'danger'});
                console.log('failed', err);
            });
    }
}
