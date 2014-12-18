angular.module('carli.modalDialog')
    .directive('modalDialog', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/modalDialog/modalDialog.html',
            scope: {
                title: '=',
                modalId: '=',
                modalClass: '@'
            },
            transclude: true
        };
    });
