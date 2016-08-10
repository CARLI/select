angular.module('common.viewEditDirectives.viewEditTypeahead')
    .directive('viewEditTypeahead', function() {
        return {
            restrict: 'E',
            template: [
            '<div ng-show="editMode">',
            '    <input type="text" ng-model="ngModel" typeahead="option as option.name for option in options | filter:{ name: $viewValue }" id="{{ inputId }}" autocomplete="off">',
            '</div>',
            '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                options: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
