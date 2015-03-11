angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .directive('librariesSelectingProductsByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/librariesSelectingProducts/librariesSelectingProductsByLibrary.html',
            scope: {},
            controller: 'librariesSelectingProductsByLibraryController',
            controllerAs: 'vm',
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            $(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
