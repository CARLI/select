angular.module('carli.selectCycle')
    .directive('selectCycle', function(cycleService) {
        return {
            restrict: 'E',
            templateUrl: '/carliApp/components/selectCycle/selectCycle.html',
            scope: {
                inputId: '@'
            },
            link: function(scope, element, attrs) {
                var select = element.find('select');

                activate();

                function activate() {
                    cycleService.listActiveCycles().then(function(activeCycles) {
                        scope.activeCycles = activeCycles;
                        scope.activeCycles.sort(cycleService.sortCycles);
                        bindSelectInput();
                    });
                }

                function setCurrentCycle(cycleId) {
                    var cycle = getCycleFromSelection();

                    scope.$apply(function(){
                        cycleService.setCurrentCycle(cycle);
                    });

                    function getCycleFromSelection(){
                        return scope.activeCycles.filter(function(cycle){
                            return cycle.id === cycleId;
                        })[0];
                    }
                }

                function bindSelectInput(){
                    scope.activeCycles.forEach(function(cycle){
                        select.append( $('<option></option>').attr('value',cycle.id).text(cycle.name) );
                    });

                    select.on('change', function(e){
                        setCurrentCycle( select.val() );
                    });

                    watchCurrentCycle();

                    function watchCurrentCycle() {
                        scope.$watch(cycleService.getCurrentCycle, function (newValue) {
                            if (newValue) {
                                select.val(newValue.id);
                            }
                        });
                    }
                }
            }
        };
    });
