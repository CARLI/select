angular.module('vendor.quickPricing')
    .directive('quickPricingEntitySelector', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingEntitySelector.html',
            scope: {
                entities: '=',
                selectedEntityIds: '='
            },
            controller: 'quickPricingEntitySelectorController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
