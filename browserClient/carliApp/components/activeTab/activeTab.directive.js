angular.module('carli.activeTab')
    .directive('activeTab', activeTab);

    function activeTab($location) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                scope.$on("$routeChangeSuccess", function (event, current, previous) {
                    var pathLevel = attrs.activeTab || 1;
                    var pathToCheck = $location.path().split('/')[pathLevel] ||
                        "current $location.path doesn't reach this level";
                    var tabLink = attrs.href.split('/')[pathLevel] ||
                        "href doesn't include this level";

                    if (pathToCheck === tabLink) {
                        element.parent().addClass("active");
                    } else {
                        element.parent().removeClass("active");
                    }
                });
            }
        };
    }
