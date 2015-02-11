angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .directive('vendorsSettingPricesByVendor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/vendorsSettingPrices/vendorsSettingPricesByVendor.html',
            scope: {},
            controller: 'vendorsSettingPricesByVendorController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
