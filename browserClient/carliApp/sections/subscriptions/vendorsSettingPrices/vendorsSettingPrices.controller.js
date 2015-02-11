angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( libraryService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;

    function closeVendorPricing(){
        vm.cycleRouter.previous();
    }
}
