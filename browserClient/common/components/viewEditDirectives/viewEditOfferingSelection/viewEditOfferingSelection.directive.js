angular.module('common.viewEditDirectives.viewEditOfferingSelection')
    .directive('viewEditOfferingSelection', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditOfferingSelection/viewEditOfferingSelection.html',
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
