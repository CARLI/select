angular.module('library.sections.dashboard')
.controller('dashboardController', dashboardController);

function dashboardController( cycleService, userService ){
    var vm = this;

    vm.cycles = [];
    vm.library = {};
    vm.loadingPromise = null;
    vm.cycleForUnselectedProducts = null;
    vm.selectedLicenseId = null;
    vm.userIsReadOnly = userService.userIsReadOnly;

    vm.showLicenseAgreements = showLicenseAgreements;
    vm.viewUnselectedProductsFor = viewUnselectedProductsFor;

    activate();


    function activate(){
        vm.library = userService.getUser().library;

        vm.loadingPromise = cycleService.listNonArchivedClosedCyclesIncludingOneTimePurchase().then(function(cycleList){
            vm.cycles = cycleList;
        });
    }

    function viewUnselectedProductsFor(cycle){
        vm.cycleForUnselectedProducts = cycle;
        $('#unselected-products-modal').modal(true);
    }

    function showLicenseAgreements(licenseId){
        vm.selectedLicenseId = licenseId;
        $('#redacted-license-popup').modal(true);
    }
}
