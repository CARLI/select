angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesController', carliCheckingPricesController);

function carliCheckingPricesController( $q, notificationService ) {
    var vm = this;
    vm.undoCloseVendorPricing = undoCloseVendorPricing;
    vm.openSystem = openSystem;
    vm.openSystemMessage = {};
    vm.openSystemDialogComplete = openSystemDialogComplete;

    function undoCloseVendorPricing(){
        return vm.cycleRouter.previous();
    }

    function openSystem(){
        //modal submit calls openSystemDialogComplete
        $('#open-system-modal').modal('show');
    }

    function openSystemDialogComplete(){
        //do great and terrible things with vm.openSystemMessage

        if (!vm.openSystemMessage.doNotSend) {
            notificationService.sendNotification(vm.openSystemMessage);
        }

        return closeModal().then(vm.cycleRouter.next);
    }

    function closeModal() {
        var deferred = $q.defer();
        $('#open-system-modal').modal('hide');
        $('#open-system-modal').on('hidden.bs.modal', function (e) {
            deferred.resolve();
        });
        return deferred.promise;
    }
}
