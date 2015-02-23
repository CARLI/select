angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .controller('librariesSelectingProductsController', librariesSelectingProductsController);

function librariesSelectingProductsController( $q, notificationService ) {
    var vm = this;
    vm.undoOpenSystem = undoOpenSystem;
    vm.closeSystem = closeSystem;

    function undoOpenSystem(){
        vm.cycleRouter.previous();
    }

    function closeSystem(){
        vm.cycleRouter.next();
    }
}
