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

    scope.$watch('scrollPosition', updateScrollPosition);

    function updateScrollPosition(newPosition) {
        var scrollPanelWidth = controlledElement.width();
        var columnHeaders = controlledElement.find('.column.header');
        var lastHeader = columnHeaders[columnHeaders.length - 1];
        scrollPanelWidth -= $(lastHeader).width();

        var pixelValue = scrollPanelWidth * newPosition;
        controlledElement.css('left', '-' + pixelValue + 'px');
    }
}
