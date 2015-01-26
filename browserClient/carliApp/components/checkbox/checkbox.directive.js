angular.module('carli.checkbox')
    .directive('checkbox', checkbox);

    function checkbox(uuid) {
        var keyCode = { SPACE: 32 };

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
                element.find('input[type="checkbox"]').on('focus', function(evt) {
                    element.addClass('focused');
                }).on('blur', function(evt) {
                    element.removeClass('focused');
                });
            }
        };
    }
