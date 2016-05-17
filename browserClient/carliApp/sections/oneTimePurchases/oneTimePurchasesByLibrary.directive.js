angular.module('carli.sections.oneTimePurchases')
    .directive('oneTimePurchasesByLibrary', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/sections/oneTimePurchases/oneTimePurchasesByLibrary.html',
            scope: {
                notifyParentOfSave: '=onOfferingSaved'
            },
            controller: 'oneTimePurchasesByLibraryController',
            controllerAs: 'vm',
            bindToController: true,
            link: postLink
        };

        function postLink( scope, element, attributes, controller ){
            //$(window).bind('beforeunload', controller.warnIfUnsavedBeforeUnload);
            //scope.$on('$locationChangeStart', controller.warnIfUnsavedBeforeLocationChange);
        }
    });
