angular.module('carli.collapsible')
    .directive('collapsible', collapsible);

    function collapsible() {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                element.on('click', 'header', function(event){
                   element.toggleClass('collapsed');
                });
            }
        };
    }
