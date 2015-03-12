angular.module('carli.sections.subscriptions.productsAvailable')
    .directive('productsAvailableByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/subscriptions/productsAvailable/productsAvailableByLibrary.html',
            scope: {
                notifyParentOfSave: '=onOfferingSaved'
            },
            controller: 'productsAvailableByLibraryController',
            controllerAs: 'vm',
            bindToController: true,
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            $(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
