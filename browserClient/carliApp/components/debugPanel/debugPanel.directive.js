angular.module('carli.debugPanel')
    .directive('debugPanel', debugPanel);

function debugPanel() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'carliApp/components/debugPanel/debugPanel.html'
    };
}
