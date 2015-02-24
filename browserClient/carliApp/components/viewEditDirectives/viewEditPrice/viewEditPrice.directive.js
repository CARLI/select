angular.module('carli.viewEditDirectives.viewEditPrice')
    .directive('viewEditPrice', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditPrice/viewEditPrice.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
