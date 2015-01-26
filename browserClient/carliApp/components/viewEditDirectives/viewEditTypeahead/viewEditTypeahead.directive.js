angular.module('carli.viewEditDirectives.viewEditTypeahead')
    .directive('viewEditTypeahead', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditTypeahead/viewEditTypeahead.html',
            scope: {
                ngModel: '=',
                options: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
