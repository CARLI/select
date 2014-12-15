angular.module('carli.checkbox')
    .directive('checkbox', checkbox);

    function checkbox() {
        return {
            restrict: 'E',
            templateUrl: 'carliApp/components/checkbox/checkbox.html',
            scope: {
                ngModel: '=',
                id: '='
            },
            transclude: true
        };
    }
