angular.module('carli.sections.subscriptions.vendorsSettingPrices')
    .controller('vendorsSettingPricesController', vendorsSettingPricesController);

function vendorsSettingPricesController( $q, notificationService ) {
    var vm = this;
    vm.closeVendorPricing = closeVendorPricing;
    vm.openSystem = openSystem;
    vm.openSystemMessage = {};
    vm.openSystemDialogComplete = openSystemDialogComplete;

    function closeVendorPricing(){
        vm.cycleRouter.previous();
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

        closeModal().then(vm.cycleRouter.next);
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
