angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .directive('carliCheckingPrices', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/carliCheckingPrices/carliCheckingPrices.html',
            scope: {
                cycleRouter: '='
            },
            controller: 'carliCheckingPricesController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
