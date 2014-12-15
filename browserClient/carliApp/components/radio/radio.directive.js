angular.module('carli.radio')
    .directive('radio', radio);

    function radio() {
        return {
            restrict: 'E',
            templateUrl: 'carliApp/components/radio/radio.html',
            scope: {
                ngModel: '=',
                name: '=',
                value: '=',
                id: '='
            },
            transclude: true
        };
    }
