angular.module('library.unselectedProducts')
    .directive('unselectedProducts', function(){
        return {
            restrict: 'E',
            templateUrl: 'libraryApp/components/unselectedProducts/unselectedProducts.html',
            scope: {
                cycle: '='
            },
            controller: 'unselectedProductsController',
            controllerAs: 'vm',
            bindToController: true
        };
    });