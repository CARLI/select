angular.module('carli.selectCycle')
    .directive('selectCycle', function(cycleService) {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/selectCycle/selectCycle.html',
            scope: {
                inputId: '@'
            },
            link: function(scope, element, attrs) {
                scope.currentCycle = cycleService.getCurrentCycle();
                scope.setCurrentCycle = function() {
                    cycleService.setCurrentCycle(scope.currentCycle);
                };

                activate();

                function activate() {
                    cycleService.listActiveCycles().then(function(activeCycles) {
                        scope.activeCycles = activeCycles;
                    });
                    watchCurrentCycle();
                }

                function watchCurrentCycle() {
                    scope.$watch(cycleService.getCurrentCycle, function (newValue) {
                        if (newValue) {
                            scope.currentCycle = newValue;
                        }
                    });
                }
            }
        };
    });
