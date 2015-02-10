angular.module('carli.sections.subscriptions.editCycle')
    .controller('editCycleController', editCycleController);

function editCycleController( $routeParams, alertService, cycleService ) {
    var cycleRouter = this;
    cycleRouter.cycleId = $routeParams.id;

    activate();

    function activate(){
        cycleService.load(cycleRouter.cycleId).then( function( cycle ) {
            cycleRouter.cycle = cycle;
            cycleRouter.status = cycle.status;

            cycleRouter.cycleRouter = {
                next: cycleRouterNext,
                previous: cycleRouterPrevious
            };

            cycleService.setCurrentCycle(cycle);
        } );
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
            .then(function () {
                cycleRouter.status = cycleRouter.cycle.status;
            })
            .catch(function(err){
                alertService.putAlert(err, {severity: 'danger'});
            });
    }
}
