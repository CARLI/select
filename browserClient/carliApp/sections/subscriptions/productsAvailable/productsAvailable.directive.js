angular.module('carli.sections.subscriptions.productsAvailable')
    .directive('productsAvailable', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/productsAvailable/productsAvailable.html',
            scope: {
                cycleRouter: '=',
                cycle: '='
            },
            controller: 'productsAvailableController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
