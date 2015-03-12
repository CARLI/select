angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .directive('vendorsSettingPricesByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/vendorsSettingPrices/vendorsSettingPricesByLibrary.html',
            scope: {},
            controller: 'vendorsSettingPricesByLibraryController',
            controllerAs: 'vm',
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            $(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
