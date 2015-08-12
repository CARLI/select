angular.module('common.checkbox')
    .directive('checkbox', checkbox);

    function checkbox(uuid) {
        var keyCode = { SPACE: 32 };

        return {
            restrict: 'E',
            template: '<input id="{{ checkboxId }}" type="checkbox" ng-model="ngModel" ng-disabled="ngDisabled"><label for="{{ checkboxId }}"><span class="fa checkbox-display" /><ng-transclude></ng-transclude></label>',
            scope: {
                ngModel: '=',
                id: '=',
                ngDisabled: '='
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
