angular.module('carli.viewEditDirectives.viewEditNumberField')
    .directive('viewEditNumberField', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditNumberField/viewEditNumberField.html',
            scope: { ngModel: '=', editMode: '=' },
            transclude: true
        };
    });
