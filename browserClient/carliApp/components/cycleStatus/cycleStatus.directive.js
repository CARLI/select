/**
 * @name Cycle Status 
 * @ngdoc directive
 * @description 
 *
 * Displays a single Cycle Name + Status - for examble on the first page of the 'Subscriptions' wireframe.
 */
angular.module('carli.cycleStatus')
.directive('cycleStatus', function(){
    return {
        restrict: 'E',
        templateUrl: 'carliApp/components/cycleStatus/cycleStatus.html',
        scope: {
            cycle: '='
        }
    };
});
