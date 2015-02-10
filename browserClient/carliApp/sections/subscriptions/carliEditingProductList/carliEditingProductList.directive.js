angular.module('carli.sections.subscriptions.carliEditingProductList')
    .directive('carliEditingProductList', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/carliEditingProductList/carliEditingProductList.html',
            scope: {
                cycleRouter: '='
            },
            controller: 'carliEditingProductListController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
