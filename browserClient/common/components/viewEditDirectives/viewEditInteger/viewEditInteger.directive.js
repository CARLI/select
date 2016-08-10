angular.module('common.viewEditDirectives.viewEditInteger')
    .directive('viewEditInteger', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditInteger/viewEditInteger.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
