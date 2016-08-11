angular.module('common.viewEditDirectives.viewEditOfferingSelection')
    .directive('viewEditOfferingSelection', function () {
        return {
            restrict: 'E',
            template: [
                '<div class="view-edit-select carli-select" ng-show="vm.editMode">',
                '  <select ng-model="vm.offering.selection" ng-options="option.users for option in vm.selectionOptions track by option.users" id="{{ vm.offering.id }}_selection">',
                '    <option></option>',
                '  </select>',
                '</div>',
                '<div ng-show="!vm.editMode" ng-transclude></div>'
            ].join(''),
            scope: {
                offering: '=ngModel',
                editMode: '='
            },
            controller: viewEditOfferingSelectionController,
            controllerAs: 'vm',
            bindToController: true,
            transclude: true
        };
    });
