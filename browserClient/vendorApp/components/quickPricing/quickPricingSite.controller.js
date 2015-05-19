angular.module('vendor.quickPricing')
    .controller('quickPricingSiteController', quickPricingSiteController);

function quickPricingSiteController($rootScope){
    var vm = this;

    vm.quickPricingArguments = {
        mode: 'dollarAmount',
        dollarValue: null,
        percentValue: null
    };

    vm.goToStep2 = goToStep2;
    vm.goToStep3 = goToStep3;
    vm.finish = finish;

    vm.selectedProductCount = selectedProductCount;
    vm.totalProductCount = totalProductCount;
    vm.selectedLibraryCount = selectedLibraryCount;
    vm.totalLibraryCount = totalLibraryCount;

    function goToStep2() {
        $rootScope.$broadcast('accordion', 'quick-pricing-accordion-2');
        $('#quick-pricing-accordion-2 .accordion-header button').focus();
    }
    function goToStep3() {
        $rootScope.$broadcast('accordion', 'quick-pricing-accordion-3');
        $('#quick-pricing-accordion-3 .accordion-header button').focus();
    }
    function finish() {
        $rootScope.$broadcast('accordion', '');
        $('#quick-pricing-header').click();
        $('#quick-pricing-header button').focus();

        if (vm.quickPricingArguments.mode == 'dollarAmount') {
            vm.quickPricingCallback('dollarAmount', vm.quickPricingArguments.dollarValue);
        }
        if (vm.quickPricingArguments.mode == 'percentageIncrease') {
            vm.quickPricingCallback('percentageIncrease', vm.quickPricingArguments.percentValue);
        }
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
    function selectedLibraryCount() {
        var selectedIdsArray = Object.keys(vm.selectedLibraryIds).filter(function (libraryId) {
            return vm.selectedLibraryIds[libraryId];
        });
        return selectedIdsArray.length;
    }
    function totalLibraryCount() {
        return Object.keys(vm.selectedLibraryIds).length;
    }
}
