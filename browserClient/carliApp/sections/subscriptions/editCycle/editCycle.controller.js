angular.module('carli.sections.subscriptions.editCycle')
    .controller('editCycleController', editCycleController);

function editCycleController( $routeParams, activityLogService, cycleService, errorHandler ) {
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
                groupBy: cycleRouter.groupBy,
                updateStatus: updateStatus
            };

            cycleService.setCurrentCycle(cycle);
        } );
    }

    function shouldShowGroupByToggle() {
        return (
            cycleRouter.status === cycleService.CYCLE_STATUS_VENDOR_PRICING ||
            cycleRouter.status === cycleService.CYCLE_STATUS_CHECKING_PRICES ||
            cycleRouter.status === cycleService.CYCLE_STATUS_CLOSED
        );
    }

    function cycleRouterNext(){
        cycleRouter.cycle.proceedToNextStep();
        return saveCycleAndUpdateStatus();
    }

    function cycleRouterPrevious() {
        cycleRouter.cycle.returnToPreviousStep();
        return saveCycleAndUpdateStatus();
    }

    function saveCycleAndUpdateStatus(){
        var copyOfCycle = angular.copy(cycleRouter.cycle);
        return cycleService.update(copyOfCycle)
            .then(updateStatus)
            .then(logActivity);
    }

    function updateStatus(cycleId) {
        return cycleService.load(cycleId)
            .then(function (cycle) {
                cycleRouter.cycle = cycle;
                cycleRouter.status = cycle.status;
            })
            .catch(function(error){
                alertService.putAlert('Cycle did not proceed successfully. Please try again.', {severity: 'danger'});
                errorHandler(error);
            });
    }

    function logActivity(){
        return activityLogService.logCycleUpdate(cycleRouter.cycle);
    }
}
