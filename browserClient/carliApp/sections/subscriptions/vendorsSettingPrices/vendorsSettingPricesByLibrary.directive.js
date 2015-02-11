angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .directive('vendorsSettingPricesByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/vendorsSettingPrices/vendorsSettingPricesByLibrary.html',
            scope: {},
            controller: 'vendorsSettingPricesByLibraryController',
            controllerAs: 'vm'
        };
    });
