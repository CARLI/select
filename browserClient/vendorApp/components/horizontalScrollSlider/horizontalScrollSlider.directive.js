angular.module('vendor.horizontalScrollSlider')
    .directive('horizontalScrollSlider', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/horizontalScrollSlider/horizontalScrollSlider.html',
            scope: {
                selector: '@'
            },
            link: horizontalScrollSliderPostLink
        };
    });

function horizontalScrollSliderPostLink(scope, element, attrs) {
    var controlledElement = $(scope.selector);

    scope.scrollPosition = 0;
    scope.maxValue = getMaxScrollValue();

    scope.$watch('scrollPosition', updateScrollPosition);

    function updateScrollPosition(newPosition) {
        controlledElement.css('left', '-' + newPosition + 'px');
    }

    function getMaxScrollValue() {
        var elementWidth = controlledElement.width();
        var columnHeaders = controlledElement.find('.column.header');
        var lastHeader = columnHeaders[columnHeaders.length - 1];

        return elementWidth - $(lastHeader).width();
    }
}
