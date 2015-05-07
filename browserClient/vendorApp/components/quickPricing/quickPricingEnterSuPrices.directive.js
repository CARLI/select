angular.module('vendor.quickPricing')
    .directive('quickPricingEnterSuPrices', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingEnterSuPrices.html',
            scope: {
                suLevels: '=',
                selectedSuLevelIds: '=',
                quickPricingArguments: '='
            },
            controller: 'quickPricingEnterSuPricesController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
