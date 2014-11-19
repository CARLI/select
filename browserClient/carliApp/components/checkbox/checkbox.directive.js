angular.module('carli.checkbox')
    .directive('checkbox', checkbox);

    function checkbox() {
        return {
            restrict: 'E',
            templateUrl: 'carliApp/components/checkbox/checkbox.html',
            scope: {
                ngModel: '='
            },
            link: function postLink(scope, element, attrs) {
                element.on('click', function(event){
                    element.find('input').click();
                });
            }
        };
    }