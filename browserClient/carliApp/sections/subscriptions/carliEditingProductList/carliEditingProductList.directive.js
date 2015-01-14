angular.module('carli.sections.subscriptions.carliEditingProductList')
    .directive('carliEditingProductList', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/carliEditingProductList/carliEditingProductList.html',
            scope: {
                cycle: '='
            },
            controller: 'carliEditingProductListController',
            controllerAs: 'vm'
        };
    });
