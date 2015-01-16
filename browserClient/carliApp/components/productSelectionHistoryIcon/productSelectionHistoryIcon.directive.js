angular.module('carli.productSelectionHistoryIcon')
    .directive('productSelectionHistoryIcon', productSelectionHistoryIcon);

    function productSelectionHistoryIcon() {
        return {
            restrict: 'E',
            template: '<fa name="{{ iconName }}"></fa>',
            scope: {
                selected: '@'
            },
            link: function (scope, element, attrs) {
                console.log(scope.selected);
                if ( scope.selected === 'selected' ){
                    scope.iconName = 'check-circle';
                }
                else if ( scope.selected === 'not selected' ){
                    scope.iconName = 'times-circle';
                }
                else {
                    scope.iconName = 'minus';
                }
            }
        };
    }
