angular.module('common.viewEditDirectives.viewEditYesNoOther')
    .directive('viewEditYesNoOther', function () {
        return {
            restrict: 'E',
            template: [
                '<div class="view-edit-yes-no-other" ng-show="editMode">',
                '  <good-select ng-model="selectedValue" input-id="{{ inputId }}" items="items"></good-select>',
                '  <input class="gap-top" type="text" ng-model="ngModel" ng-show="selectedValue === \'Other\'">',
                '</div>',
                '<div ng-show="!editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                ngModel: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true,
            link: linkYesNoOther
        };
    });

function linkYesNoOther($scope, iElement, iAttrs) {
    var scope = $scope;
    scope.items = ['Yes', 'No', 'Other'];

    scope.$watch('ngModel', function (newValue, oldValue) {
        if (newValue !== undefined) {
            if (newValue === 'Yes' || newValue === 'No') {
                scope.selectedValue = scope.ngModel;
            }
            else {
                scope.selectedValue = 'Other';
            }
        }
    });

    $scope.$on('goodSelectChange', function (event, value) {
        scope.ngModel = scope.items[value];
    });
}
