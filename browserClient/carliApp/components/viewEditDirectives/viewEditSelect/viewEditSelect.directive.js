angular.module('carli.viewEditDirectives.viewEditSelect')
    .directive('viewEditSelect', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditSelect/viewEditSelect.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                items: '='
            },
            transclude: true
        };
    })
    .directive('viewEditSelectObject', function() {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/viewEditDirectives/viewEditSelect/viewEditSelectObject.html',
            scope: {
                ngModel: '=',
                editMode: '=',
                objects: '=',
                labelProperty: '@',
                trackBy: '@'
            },
            transclude: true
        };
    })
;
