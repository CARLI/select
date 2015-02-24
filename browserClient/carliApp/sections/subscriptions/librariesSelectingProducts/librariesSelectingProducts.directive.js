angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .directive('librariesSelectingProducts', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/librariesSelectingProducts/librariesSelectingProducts.html',
            scope: {
                cycleRouter: '='
            },
            controller: 'librariesSelectingProductsController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
