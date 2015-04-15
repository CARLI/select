angular.module('vendor.quickPricing')
    .directive('quickPricingLibrarySelector', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingLibrarySelector.html',
            scope: {
                libraries: '=',
                selectedLibraryIds: '='
            },
            controller: 'quickPricingLibrarySelectorController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
