angular.module('carli.viewEditDirectives.viewEditDate')
    .directive('viewEditDate', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditDate/viewEditDate.html',
            scope: { ngModel: '=', editMode: '=', label: '@' },
            transclude: true,
            controller: 'viewEditDateController',
            controllerAs: 'vm'
        };
    });