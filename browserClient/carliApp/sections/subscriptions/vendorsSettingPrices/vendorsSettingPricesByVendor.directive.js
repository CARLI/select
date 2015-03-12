angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .directive('vendorsSettingPricesByVendor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/vendorsSettingPrices/vendorsSettingPricesByVendor.html',
            scope: {},
            controller: 'vendorsSettingPricesByVendorController',
            controllerAs: 'vm',
            bindToController: true,
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            $(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
