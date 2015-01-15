angular.module('carli.collapsible')
    .directive('collapsible', collapsible);

    function collapsible() {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var $content = element.children('.content');
                $content.css('display', 'none');
                element.on('click', 'header', function(event){
                    $content.slideToggle();
                    element.toggleClass('collapsed');
                });
            }
        };
    }
