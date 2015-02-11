angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( libraryService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;

    activate();

    function activate () {
        vm.groupBy = 'vendor';

        libraryService.list()
            .then(initLibraryList);
    }

    function initLibraryList( libraryList ){
        vm.libraryMap = {};

        libraryList.forEach(function(library){
            vm.libraryMap[library.id] = library;
        });
    }

    function closeVendorPricing(){
        vm.cycleRouter.previous();
    }
}
