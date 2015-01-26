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
                makeKeyboardAccessible();

                function makeKeyboardAccessible() {
                    element.attr('tabindex', 0);
                    // Must use keydown to prevent scrolling the page when toggling the checkbox.
                    element.on('keydown', toggleWithSpacebar);
                }
                function toggleWithSpacebar(e) {
                    if (e.keyCode == keyCode.SPACE) {
                        preventScrolling(e);
                        scope.$apply(toggleNgModel);
                    }
                }
                function preventScrolling(e) {
                    e.preventDefault();
                }
                function toggleNgModel() {
                    scope.ngModel = !scope.ngModel;
                }
            }
        };
    }
