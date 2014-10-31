angular.module('carli.viewEditDirectives.viewEditTextField')
    .directive('viewEditTextField', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditTextField/viewEditTextField.html',
            scope: { ngModel: '=', editMode: '=' },
            transclude: true
        };
    });
