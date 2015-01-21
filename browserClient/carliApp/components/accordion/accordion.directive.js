angular.module('carli.accordion')
    .directive('carliAccordion', accordion);

    function accordion( $rootScope, uuid ) {
        return {
            restrict: 'A',
            controller: accordionController,
            scope: {},
            link: function postLink(scope, element, attrs) {
                var accordionId = 'accordion' + uuid.generateCssId();

                scope.accordionId = accordionId;
                scope.element = element;

                element.children('.content').css('display', 'none');

                element.addClass('collapsed')
                .attr('id',accordionId)
                .on('click', 'header', function(event){
                    $rootScope.$broadcast('accordion', accordionId);
                });
            }
        };
    }