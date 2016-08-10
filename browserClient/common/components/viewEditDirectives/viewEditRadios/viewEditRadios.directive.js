angular.module('common.viewEditDirectives.viewEditRadios')
    .directive('viewEditRadios', function () {
        return {
            restrict: 'E',
            template: [
                '<div class="view-edit-radios" ng-show="editMode">',
                '    <fieldset>',
                '        <legend class="sr-only">{{ radioGroupLegend }}</legend>',
                '        <span ng-repeat="item in items">',
                '            <radio value="item.value" ng-model="$parent.ngModel" name="radioGroupName">{{ item.label }}</radio>',
                '        </span>',
                '    </fieldset>',
                '</div>',
                '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                items: '=',
                radioGroupName: '@',
                radioGroupLegend: '@'
            },
            transclude: true
        };
    });
