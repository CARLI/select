angular.module('vendor.quickPricing')
    .controller('quickPricingProductSelectorController', quickPricingProductSelectorController);

function quickPricingProductSelectorController() {
    var vm = this;

    vm.filter = 'all';
}