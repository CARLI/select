angular.module('carli.viewEditDirectives.viewEditPercentageField')
    .directive('viewEditPercentageField', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditPercentageField/viewEditPercentageField.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
