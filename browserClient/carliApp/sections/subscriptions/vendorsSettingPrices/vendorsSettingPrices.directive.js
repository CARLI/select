angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .directive('vendorsSettingPrices', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/vendorsSettingPrices/vendorsSettingPrices.html',
            scope: {
                cycleRouter: '='
            },
            controller: 'vendorsSettingPricesController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
