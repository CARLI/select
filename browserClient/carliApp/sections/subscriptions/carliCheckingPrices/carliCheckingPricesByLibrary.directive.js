angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .directive('carliCheckingPricesByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/carliCheckingPrices/carliCheckingPricesByLibrary.html',
            scope: {},
            controller: 'carliCheckingPricesByLibraryController',
            controllerAs: 'vm',
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            $(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
