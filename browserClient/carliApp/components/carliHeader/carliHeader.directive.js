angular.module('carli.carliHeader')
.directive('carliHeader', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '/carliApp/components/carliHeader/carliHeader.html'
    };
});
