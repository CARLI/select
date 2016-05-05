angular.module('carli.sections.oneTimePurchases')
    .directive('oneTimePurchasesByVendor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/oneTimePurchases/oneTimePurchasesByVendor.html',
            scope: {},
            controller: 'oneTimePurchasesByVendorController',
            controllerAs: 'vm',
            bindToController: true,
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            //$(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            //scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
