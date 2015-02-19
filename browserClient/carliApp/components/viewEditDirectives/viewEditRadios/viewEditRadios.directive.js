angular.module('carli.viewEditDirectives.viewEditRadios')
    .directive('viewEditRadios', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditRadios/viewEditRadios.html',
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
