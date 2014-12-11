angular.module('carli.radio')
    .directive('radio', radio);

    function radio() {
        return {
            restrict: 'E',
            templateUrl: 'carliApp/components/radio/radio.html',
            scope: {
                ngModel: '='
            },
            link: function postLink(scope, element, attrs) {
                console.log('radio link');
                element.on('click', function(event){
                    console.log('radio clicked', event.currentTarget);
                    console.log(element.find('input'));
                    element.find('input').click();
                });
            }
        };
    }
