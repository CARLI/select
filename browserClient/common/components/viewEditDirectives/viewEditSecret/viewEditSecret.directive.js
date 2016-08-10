angular.module('common.viewEditDirectives.viewEditSecret')
    .directive('viewEditSecret', function() {
        return {
            restrict: 'E',
            template: [
                '<div ng-show="editMode">',
                '    <input type="password" ng-model="ngModel" id="{{ inputId }}" aria-label="{{ ariaLabel }}">',
                '</div>',
                '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@',
                ariaLabel: '@'
            },
            transclude: true
        };
    });
