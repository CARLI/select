angular.module('vendor.quickPricing')
    .controller('quickPricingEnterSitePricesController', quickPricingEnterSitePricesController);

function quickPricingEnterSitePricesController() {
    var vm = this;

    vm.setQuickPricingMode = setQuickPricingMode;

    activate();

    function activate(){
        addDefaultArgumentValues();
    }

    function addDefaultArgumentValues() {
        vm.quickPricingArguments.deleteSuPricingToo = true;
        vm.quickPricingArguments.hideProduct = true;
    }

    function setQuickPricingMode( mode ){
        vm.quickPricingArguments.mode = mode;
    }
}
