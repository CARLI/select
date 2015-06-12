angular.module('carli.viewEditDirectives.viewEditSecret')
    .directive('viewEditSecret', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditSecret/viewEditSecret.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@',
                ariaLabel: '@'
            },
            transclude: true
        };
    });
