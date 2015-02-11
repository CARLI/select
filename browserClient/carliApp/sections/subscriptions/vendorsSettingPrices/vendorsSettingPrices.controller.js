angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( libraryService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;

    activate();

    function activate () {
        vm.groupBy = 'vendor';
    }

    function closeVendorPricing(){
        vm.cycleRouter.previous();
    }
}
