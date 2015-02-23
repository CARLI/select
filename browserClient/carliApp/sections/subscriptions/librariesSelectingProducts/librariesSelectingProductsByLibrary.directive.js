angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .directive('librariesSelectingProductsByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/librariesSelectingProducts/librariesSelectingProductsByLibrary.html',
            scope: {},
            controller: 'librariesSelectingProductsByLibraryController',
            controllerAs: 'vm'
        };
    });
