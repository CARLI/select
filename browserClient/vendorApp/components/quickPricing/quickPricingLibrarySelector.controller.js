angular.module('vendor.quickPricing')
    .controller('quickPricingLibrarySelectorController', quickPricingLibrarySelectorController);

function quickPricingLibrarySelectorController() {
    var vm = this;
    vm.selectedLibraryCount = selectedLibraryCount;
    vm.totalLibraryCount = totalLibraryCount;

    function selectedLibraryCount() {
        var selectedIdsArray = Object.keys(vm.selectedLibraryIds).filter(function (libraryId) {
            return vm.selectedLibraryIds[libraryId];
        });
        return selectedIdsArray.length;
    }
    function totalLibraryCount() {
        return Object.keys(vm.selectedLibraryIds).length;
    }
}
