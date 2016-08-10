angular.module('common.viewEditDirectives.viewEditSelect')
    .directive('viewEditSelect', function() {
        return {
            restrict: 'E',
            template: [
            '<div class="view-edit-select" ng-show="editMode">',
            '    <good-select ng-model="ngModel" items="items" input-id="{{ inputId }}"></good-select>',
            '</div>',
            '<div ng-show="!editMode" ng-transclude></div>'
        ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                items: '=',
                inputId: '@'
            },
            transclude: true
        };
    })
    .directive('viewEditSelectObject', function() {
        return {
            restrict: 'E',
            template: [
            '<div class="view-edit-select carli-select" ng-show="editMode">',
            '    <select ng-model="ngModel" ng-options="option[labelProperty] for option in objects track by option[trackBy]" id="{{ inputId }}">',
            '        <option></option>',
            '    </select>',
            '</div>',
            '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                objects: '=',
                labelProperty: '@',
                trackBy: '@',
                inputId: '@'
            },
            transclude: true
        };
    })
;
