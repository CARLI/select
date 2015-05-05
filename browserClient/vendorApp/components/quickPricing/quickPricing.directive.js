angular.module('vendor.quickPricing')
    .directive('quickPricingSite', function () {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingSite.html',
            scope: {
                products: '=',
                selectedProductIds: '=',
                libraries: '=',
                selectedLibraryIds: '=',
                quickPricingCallback: '='
            },
            controller: 'quickPricingSiteController',
            controllerAs: 'vm',
            bindToController: true
        };
    })
    .directive('quickPricingSu', function () {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingSu.html',
            scope: {
                products: '=',
                selectedProductIds: '=',
                libraries: '=',
                selectedLibraryIds: '=',
                quickPricingCallback: '='
            },
            controller: 'quickPricingSuController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
