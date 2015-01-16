angular.module('carli.productSelectionHistoryIcon')
    .directive('productSelectionHistoryIcon', productSelectionHistoryIcon);

    function productSelectionHistoryIcon() {
        return {
            restrict: 'E',
            template: '<fa class="{{ color }}" name="{{ iconName }}"></fa>',
            scope: {
                selected: '@'
            },
            link: function (scope, element, attrs) {
                if ( scope.selected === 'selected' ){
                    scope.color = "orange";
                    scope.iconName = 'check-circle';
                }
                else if ( scope.selected === 'not selected' ){
                    scope.color = "black";
                    scope.iconName = 'times-circle';
                }
                else {
                    scope.color = "black";
                    scope.iconName = 'minus';
                }
            }
        };
    }
