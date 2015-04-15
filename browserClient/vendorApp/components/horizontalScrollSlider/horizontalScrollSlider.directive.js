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

    function updateScrollPosition(percentage) {
        var scrollPanelWidth = controlledElement[0].scrollWidth;
        var viewportWidth = controlledElement.width();

        var pixelValue = (scrollPanelWidth - viewportWidth) * percentage;
        controlledElement.css('left', '-' + pixelValue + 'px');
    }
}
