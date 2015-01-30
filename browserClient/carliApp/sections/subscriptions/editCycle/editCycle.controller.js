angular.module('carli.sections.subscriptions.editCycle')
    .controller('editCycleController', editCycleController);

function editCycleController( $routeParams, $location, cycleService ) {
    var cycleRouter = this;
    cycleRouter.cycleId = $routeParams.id;
    cycleService.load(cycleRouter.cycleId).then( function( cycle ) {
        cycleRouter.cycle = cycle;
        cycleService.setCurrentCycle(cycle);
    } );
}
