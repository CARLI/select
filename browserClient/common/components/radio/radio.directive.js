angular.module('common.radio')
    .directive('radio', radio);

    function radio(uuid) {
        //noinspection StringLiteralBreaksHTMLJS
        return {
            restrict: 'E',
            template: '<input id="{{ radioId }}" name="{{ name }}" ng-value="value" type="radio" ng-model="ngModel">' + "\n" +
                      '<label for="{{ radioId }}"><i class="fa radio-display"></i><ng-transclude></ng-transclude></label>',
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
