angular.module('carli.goodSelect')
    .directive('goodSelect', function() {
        return {
            restrict: 'EA',
            templateUrl: '/carliApp/components/goodSelect/goodSelect.html',
            transclude: true
        };
    });