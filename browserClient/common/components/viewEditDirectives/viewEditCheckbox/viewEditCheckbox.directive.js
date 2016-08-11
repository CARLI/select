angular.module('common.viewEditDirectives.viewEditCheckbox')
    .directive('viewEditCheckbox', function () {
        return {
            restrict: 'E',
            template: [
                '<div ng-show="editMode">',
                '    <checkbox ng-model="ngModel" id="inputId">{{ label }}</checkbox>',
                '</div>',
                '<div ng-show="!editMode" ng-transclude></div>'
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
