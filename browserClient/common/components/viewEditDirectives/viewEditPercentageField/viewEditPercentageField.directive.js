angular.module('common.viewEditDirectives.viewEditPercentageField')
    .directive('viewEditPercentageField', function() {
        return {
            restrict: 'E',
            template: [
                '<div class="percentage-field" ng-show="editMode">',
                '    <input type="number" step="1" min="0" max="100" ng-model="ngModel" id="{{ inputId }}">',
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
