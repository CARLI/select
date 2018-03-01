angular.module('common.viewEditDirectives.viewEditInteger')
    .directive('viewEditInteger', function() {
        return {
            restrict: 'E',
            template: [
            '<div ng-show="editMode">',
            '    <input type="number" step="1" min="0" ng-model="ngModel" ng-change="ngChange" id="{{ inputId }}">',
            '</div>',
            '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                ngChange: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
