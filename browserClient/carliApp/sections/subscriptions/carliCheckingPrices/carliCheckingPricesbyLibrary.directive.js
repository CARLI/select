angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .directive('carliCheckingPricesByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/carliCheckingPrices/carliCheckingPricesByLibrary.html',
            scope: {},
            controller: 'carliCheckingPricesByLibraryController',
            controllerAs: 'vm'
        };
    });
