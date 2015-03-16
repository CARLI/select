angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( $q, notificationService ) {
    var vm = this;
    vm.undoOpenVendorPricing = undoOpenVendorPricing;
    vm.closeVendorPricing = closeVendorPricing;

    function undoOpenVendorPricing(){
        return vm.cycleRouter.previous();
    }

    function closeVendorPricing(){
        return vm.cycleRouter.next();
    }

}
