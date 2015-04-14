angular.module('vendor.quickPricing')
    .directive('quickPricingSite', function () {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingSite.html',
            scope: {},
            controller: 'quickPricingSiteController',
            controllerAs: 'vm',
            bindToController: true
        };
    })
    .directive('quickPricingSu', function () {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/quickPricing/quickPricingSu.html',
            scope: {},
            controller: 'quickPricingSuController',
            controllerAs: 'vm',
            bindToController: true
        };
    });