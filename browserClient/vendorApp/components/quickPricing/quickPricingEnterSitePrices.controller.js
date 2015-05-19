angular.module('vendor.quickPricing')
    .controller('quickPricingEnterSitePricesController', quickPricingEnterSitePricesController);

function quickPricingEnterSitePricesController() {
    var vm = this;

    vm.setQuickPricingMode = setQuickPricingMode;

    function setQuickPricingMode( mode ){
        vm.quickPricingArguments.mode = mode;
    }
}
