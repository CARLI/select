angular.module('common.collapsible')
    .directive('collapsible', collapsible);

    function collapsible() {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var $content = element.children('.content');
                $content.css('display', 'none');

                element.addClass('collapsed').on('click', '.collapsible-header', function(event){
                    $content.slideToggle();
                    element.toggleClass('collapsed');
                });
            }
        };
    }
