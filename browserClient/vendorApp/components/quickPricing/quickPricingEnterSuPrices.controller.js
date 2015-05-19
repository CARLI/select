angular.module('vendor.quickPricing')
    .controller('quickPricingEnterSuPricesController', quickPricingEnterSuPricesController);

function quickPricingEnterSuPricesController() {
    var vm = this;

    vm.setQuickPricingMode = setQuickPricingMode;

    function setQuickPricingMode( mode ){
        vm.quickPricingArguments.mode = mode;
    }
}
