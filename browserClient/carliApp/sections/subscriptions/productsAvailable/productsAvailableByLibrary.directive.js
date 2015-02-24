angular.module('carli.sections.subscriptions.productsAvailable')
    .directive('productsAvailableByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/productsAvailable/productsAvailableByLibrary.html',
            scope: {},
            controller: 'productsAvailableByLibraryController',
            controllerAs: 'vm'
        };
    });
