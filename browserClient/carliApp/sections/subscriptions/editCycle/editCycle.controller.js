angular.module('carli.sections.subscriptions.editCycle')
    .controller('editCycleController', editCycleController);

function editCycleController( $routeParams, alertService, cycleService ) {
    var cycleRouter = this;
    cycleRouter.cycleId = $routeParams.id;
    cycleRouter.shouldShowGroupByToggle = shouldShowGroupByToggle;

    activate();

    function activate(){
        cycleRouter.groupBy = 'vendor';

        cycleService.load(cycleRouter.cycleId).then( function( cycle ) {
            cycleRouter.cycle = cycle;
            cycleRouter.status = cycle.status;

            cycleRouter.cycleRouter = {
                next: cycleRouterNext,
                previous: cycleRouterPrevious,
                groupBy: cycleRouter.groupBy
            };

            cycleService.setCurrentCycle(cycle);
        } );
    }

    function shouldShowGroupByToggle() {
        return (cycleRouter.status === 1 || cycleRouter.status === 2 || cycleRouter.status === 4 );
    }

    function cycleRouterNext(){
        cycleRouter.cycle.proceedToNextStep();
        saveCycleAndUpdateStatus();
    }

    function cycleRouterPrevious() {
        cycleRouter.cycle.returnToPreviousStep();
        saveCycleAndUpdateStatus();
    }

    function saveCycleAndUpdateStatus(){
        cycleService.update(cycleRouter.cycle)
            .then(cycleService.load)
            .then(function (cycle) {
                cycleRouter.cycle = cycle;
                cycleRouter.status = cycle.status;
            })
            .catch(function(err){
                alertService.putAlert(err, {severity: 'danger'});
            });
    }
}
