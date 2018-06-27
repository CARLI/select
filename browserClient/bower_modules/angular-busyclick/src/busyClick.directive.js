angular.module('busyClick',[])
.directive('busyClick', function($parse){
    return {
        restrict: 'A',
        compile: compileBusyClickDirective

    };

    function compileBusyClickDirective( element, attrs ){
        var directiveClickFunction = $parse(attrs.busyClick);

        return function linkBusyClickDirective( scope, element, attrs ){
            var busyClickPromise = null;


            element.on('click', function(event) {
                if ( isBusy() ){
                    return;
                }
                
                scope.$apply(function() {
                    resultsPromise = directiveClickFunction(scope, {$event:event});
                    if ( resultsPromise && resultsPromise.finally ){
                        startBusy(resultsPromise);
                    }
                });
            });


            function isBusy(){
                return !!busyClickPromise;
            }

            function startBusy( promise ){
                busyClickPromise = promise;
                element.addClass('busy');
                busyClickPromise.finally(stopBusy);
            }

            function stopBusy(){
                element.removeClass('busy');
                busyClickPromise = null;
            }
        };
    }
});
