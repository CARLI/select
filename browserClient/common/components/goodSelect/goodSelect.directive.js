angular.module('common.goodSelect')
    .directive('goodSelect', function () {
        return {
            restrict: 'EA',
            template: [
                '<div class="carli-select">',
                '    <select ng-model="ngModel" ng-options="option for option in items" id="{{ inputId }}"></select>',
                '</div>'
            ].join(''),
            scope: {
                ngModel: '=',
                items: '=',
                inputId: '@'
            },
            link: function (scope, element, attrs) {
                var select = element.find('select');
                select.on('change', function (e) {
                    scope.$emit('goodSelectChange', select.val());
                });
            }
        };
    });
