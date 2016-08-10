angular.module('common.viewEditDirectives.viewEditPrice')
    .directive('viewEditPrice', function() {
        return {
            restrict: 'E',
            template: [
                ''
            ].join(''),
            scope: {
                ngModel: '=',
                fundedPrice: '=',
                editMode: '=',
                inputId: '@'
            },
            transclude: true
        };
    });
