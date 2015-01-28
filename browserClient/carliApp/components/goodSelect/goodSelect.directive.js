angular.module('carli.goodSelect')
    .directive('goodSelect', function() {
        return {
            restrict: 'EA',
            templateUrl: '/carliApp/components/goodSelect/goodSelect.html',
            scope: {
                ngModel: '=',
                items: '=',
                inputId: '@'
            },
            link: function(scope, element, attrs) {
                var select = element.find('select');
                select.on('change', function(e){
                    scope.$emit('goodSelectChange', select.val());
                });
            }
        };
    });
