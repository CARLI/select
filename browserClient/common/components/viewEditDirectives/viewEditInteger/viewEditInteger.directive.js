angular.module('common.viewEditDirectives.viewEditInteger')
    .directive('viewEditInteger', function() {
        return {
            restrict: 'E',
            template: [
            '<div ng-show="editMode">',
            '    <input type="number" step="1" min="0" ng-model="ngModel" id="{{ inputId }}">',
            '</div>',
            '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
