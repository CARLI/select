angular.module('carli.checkbox')
    .directive('checkbox', checkbox);

    function checkbox(uuid) {
        return {
            restrict: 'E',
            templateUrl: 'carliApp/components/checkbox/checkbox.html',
            scope: {
                ngModel: '=',
                id: '='
            },
            transclude: true,
            link: function (scope, element, attrs) {
                    scope.checkboxId = scope.id ? scope.id : uuid.generateCssId();
            }
        };
    }
