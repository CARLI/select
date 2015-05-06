angular.module('vendor.quickPricing')
    .controller('quickPricingSuController', quickPricingSuController);

function quickPricingSuController( $rootScope ){
    var vm = this;

    vm.goToStep2 = goToStep2;
    vm.goToStep3 = goToStep3;
    vm.finish = finish;
    vm.selectedProductCount = selectedProductCount;
    vm.totalProductCount = totalProductCount;

    function goToStep2() {
        $rootScope.$broadcast('accordion', 'quick-pricing-accordion-2');
    }

    function goToStep3() {
        $rootScope.$broadcast('accordion', 'quick-pricing-accordion-3');
    }

    function finish() {
        $rootScope.$broadcast('accordion', '');
        $('#quick-pricing-header').click();
        vm.quickPricingCallback('finish SU quick pricing');
    }

    function selectedProductCount() {
        var selectedIdsArray = Object.keys(vm.selectedProductIds).filter(function (productId) {
            return vm.selectedProductIds[productId];
        });
        return selectedIdsArray.length;
    }

    function totalProductCount() {
        return Object.keys(vm.selectedProductIds).length;
    }
}