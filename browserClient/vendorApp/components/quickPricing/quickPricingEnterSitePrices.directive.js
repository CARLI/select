angular.module('vendor.quickPricing')
    .directive('quickPricingEnterSitePrices', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingEnterSitePrices.html',
            scope: {
                quickPricingArguments: '='
            },
            controller: 'quickPricingEnterSitePricesController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
