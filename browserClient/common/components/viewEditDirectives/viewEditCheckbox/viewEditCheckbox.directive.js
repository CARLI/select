angular.module('common.viewEditDirectives.viewEditCheckbox')
    .directive('viewEditCheckbox', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditCheckbox/viewEditCheckbox.html',
            template: [
                ''
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                label: '@',
                inputId: '@'
            },
            transclude: true
        };
    });
