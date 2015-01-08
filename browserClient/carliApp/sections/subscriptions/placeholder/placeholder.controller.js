angular.module('carli.sections.subscriptions.placeholder')
    .controller('placeholderController', placeholderController);

function placeholderController( $routeParams, $location, cycleService ) {
    var vm = this;
    vm.cycleId = $routeParams.id;
    cycleService.load(vm.cycleId).then( function( cycle ) {
        vm.cycle = cycle;
    } );
}
