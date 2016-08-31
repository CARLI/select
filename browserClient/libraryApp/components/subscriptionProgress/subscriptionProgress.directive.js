angular.module('library.subscriptionProgress')
.directive('subscriptionProgress', function(){
    return {
        restrict: 'E',
        templateUrl: '/libraryApp/components/subscriptionProgress/subscriptionProgress.html',
        scope: {
            step: '=',
            cycle: '='
        },
        controller: function($scope) {
            $scope.$watch('cycle', function (cycle) {
                $scope.computedCycleEndDate = computeCycleEndDate(cycle);
                $scope.isOneTimePurchaseCycle = cycle.cycleType == 'One-Time Purchase';
            });

            function computeCycleEndDate(cycle) {
                return moment(cycle.productsAvailableDate).add(1, 'year').subtract(1, 'day').toISOString();
            }
        }
    };
});
