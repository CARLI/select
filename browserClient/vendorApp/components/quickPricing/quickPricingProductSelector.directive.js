angular.module('vendor.quickPricing')
    .directive('quickPricingProductSelector', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingProductSelector.html',
            scope: {
                products: '=',
                selectedProductIds: '='
            },
            controller: 'quickPricingProductSelectorController',
            controllerAs: 'vm',
            bindToController: true
        };
    });