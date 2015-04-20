angular.module('common.accordion')
    .directive('carliAccordion', accordion);

    function accordion( $rootScope, uuid ) {
        return {
            restrict: 'A',
            controller: accordionController,
            scope: {},
            link: function postLink(scope, element, attrs) {
                var accordionId = getAccordionId(element);

                scope.accordionId = accordionId;
                scope.element = element;

                element.children('.content').css('display', 'none');

                element.addClass('collapsed')
                    .attr('id',accordionId)
                    .on('click', 'div.accordion-header', function(event){
                        $rootScope.$broadcast('accordion', accordionId);
                    });
            }
        };

        function getAccordionId(element) {
            if (element.attr('id')) {
                return element.attr('id');
            } else {
                return 'accordion' + uuid.generateCssId();
            }
        }
    }
