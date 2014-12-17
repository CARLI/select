angular.module('carli.radio')
    .directive('radio', radio);

    function radio( uuid ) {
        return {
            restrict: 'E',
            templateUrl: 'carliApp/components/radio/radio.html',
            scope: {
                ngModel: '=',
                name: '=',
                value: '=',
                id: '='
            },
            transclude: true,
            link: function (scope, element, attrs) {
                scope.radioId = scope.id ? scope.id : uuid.generateCssId();
            }
        };
    }
