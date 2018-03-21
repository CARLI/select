angular.module('library.productInfo')
    .directive('productInfo', function() {
        return {
            restrict: 'E',
            templateUrl: '/libraryApp/components/productInfo/productInfo.html',
            scope: {
                offering: '='
            },
            controller: 'productInfoController',
            controllerAs: 'vm',
            bindToController: true
        };
    });
