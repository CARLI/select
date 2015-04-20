angular.module('vendor.quickPricing')
    .controller('quickPricingEnterPricesController', quickPricingEnterPricesController);

function quickPricingEnterPricesController() {
    var vm = this;

    vm.priceEntryMode = 'dollarAmount';
}
