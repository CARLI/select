angular.module('common.viewEditDirectives.viewEditTextArea')
    .directive('viewEditTextArea', function () {
        return {
            restrict: 'E',
            template: [
                '<div ng-show="editMode">',
                '    <textarea ng-model="ngModel" id="{{ inputId }}"></textarea>',
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
