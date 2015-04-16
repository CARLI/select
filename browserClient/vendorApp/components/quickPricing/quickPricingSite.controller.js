angular.module('vendor.quickPricing')
    .controller('quickPricingSiteController', quickPricingSiteController);

function quickPricingSiteController($rootScope){
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
