angular.module('vendor.quickPricing')
    .controller('quickPricingSuController', quickPricingSuController);

function quickPricingSuController(){
    var vm = this;

    vm.goToStep2 = goToStep2;
    vm.goToStep3 = goToStep3;

    function goToStep2() {
        $rootScope.$broadcast('accordion', 'quick-pricing-accordion-2');
    }
    function goToStep3() {
        $rootScope.$broadcast('accordion', 'quick-pricing-accordion-3');
    }
}