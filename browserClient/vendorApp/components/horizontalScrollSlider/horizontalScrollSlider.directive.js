angular.module('vendor.horizontalScrollSlider')
    .directive('horizontalScrollSlider', function() {
        return {
            restrict: 'E',
            templateUrl: '/vendorApp/components/horizontalScrollSlider/horizontalScrollSlider.html',
            scope: {
                containerSelector: '@',
                contentSelector: '@'
            },
            link: horizontalScrollSliderPostLink
        };
    });

function horizontalScrollSliderPostLink(scope, element, attrs) {
    initializeScrolledElement();
    initializeKeyboardControl();

    function initializeScrolledElement() {
        var containerElement = $(scope.containerSelector);
        var controlledElement = $(scope.contentSelector);

        scope.scrollPosition = 0;
        scope.$watch('scrollPosition', updateScrollPosition);

        function updateScrollPosition(percentage) {
            var viewPortWidth = containerElement.width();
            var scrollPanelWidth = controlledElement.width();

            var pixelValue = (scrollPanelWidth - viewPortWidth) * percentage;
            controlledElement.css('left', '-' + pixelValue + 'px');
        }
    }

    function initializeKeyboardControl() {
        var stepAmount = 0.05;
        element.on('keydown', function(e) {
            switch(e.which) {
                case 39: // right
                case 38: // up
                    if (scope.scrollPosition < 1) {
                        scope.$apply(function() {
                            scope.scrollPosition += stepAmount;
                        });
                    }
                    break;

                case 37: // left
                case 40: // down
                    if (scope.scrollPosition > 0) {
                        scope.$apply(function() {
                            scope.scrollPosition -= stepAmount;
                        });
                    }
                    break;

                default: return;
            }
            e.preventDefault();
        });
    }
}
