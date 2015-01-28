angular.module('carli.viewEditDirectives.viewEditTextArea')
    .directive('viewEditTextArea', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditTextArea/viewEditTextArea.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
