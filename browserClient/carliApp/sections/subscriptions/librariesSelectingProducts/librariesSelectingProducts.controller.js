angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .controller('librariesSelectingProductsController', librariesSelectingProductsController);

function librariesSelectingProductsController( $q, alertService ) {
    var vm = this;
    vm.undoOpenSystem = undoOpenSystem;
    vm.closeSystem = closeSystem;
    vm.closeSystemDialogComplete = closeSystemDialogComplete;
    
    function undoOpenSystem(){
        vm.cycleRouter.previous();
    }

    function closeSystem(){
        //modal submit calls openSystemDialogComplete
        $('#close-system-modal').modal('show');
    }

    function closeSystemDialogComplete(){
        closeModal().then(vm.cycleRouter.next);
    }

    function closeModal() {
        var deferred = $q.defer();
        $('#close-system-modal').modal('hide');
        $('#close-system-modal').on('hidden.bs.modal', function (e) {
            alertService.putAlert('System closed', {severity: 'success'});
            deferred.resolve();
        });
        return deferred.promise;
    }
}
