angular.module('carli.sections.subscriptions.productsAvailable')
    .controller('productsAvailableController', productsAvailableController);

function productsAvailableController( $q, alertService ) {
    var vm = this;
    vm.undoCloseSystem = undoCloseSystem;

    function undoCloseSystem(){
        vm.cycleRouter.previous();
    }
}
