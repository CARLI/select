angular.module('carli.viewEditDirectives.viewEditCheckbox')
    .directive('viewEditCheckbox', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditCheckbox/viewEditCheckbox.html',
            scope: { ngModel: '=', editMode: '=', label: '@' },
            transclude: true
        };
    });