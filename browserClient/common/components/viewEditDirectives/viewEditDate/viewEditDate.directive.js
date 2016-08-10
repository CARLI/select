angular.module('common.viewEditDirectives.viewEditDate')
    .directive('viewEditDate', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditDate/viewEditDate.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                label: '@',
                inputId: '@',
                minDate: '@',
                maxDate: '@'
            },
            transclude: true,
            controller: 'viewEditDateController',
            controllerAs: 'vm'
        };
    });
