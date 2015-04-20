angular.module('vendor.quickPricing')
    .directive('quickPricingEnterPrices', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingEnterPrices.html',
            scope: {},
            controller: 'quickPricingEnterPricesController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
