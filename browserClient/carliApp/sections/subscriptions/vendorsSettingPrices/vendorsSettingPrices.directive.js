angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .directive('vendorsSettingPrices', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/vendorsSettingPrices/vendorsSettingPrices.html',
            scope: {
                cycle: '='
            },
            controller: 'vendorsSettingPricesController',
            controllerAs: 'vm'
        };
    });
