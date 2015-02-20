angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .directive('carliCheckingPricesByVendor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/carliCheckingPrices/carliCheckingPricesByVendor.html',
            scope: {},
            controller: 'carliCheckingPricesByVendorController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
