angular.module('carli.sections.subscriptions.productsAvailable')
    .directive('productsAvailableByVendor', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/productsAvailable/productsAvailableByVendor.html',
            scope: {
                notifyParentOfSave: '=onOfferingSaved'
            },
            controller: 'productsAvailableByVendorController',
            controllerAs: 'vm',
            bindToController: true,
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            $(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
