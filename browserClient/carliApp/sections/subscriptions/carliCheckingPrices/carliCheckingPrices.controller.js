angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesController', carliCheckingPricesController);

function carliCheckingPricesController( $q, notificationService, notificationTemplateService ) {
    var vm = this;
    vm.undoCloseVendorPricing = undoCloseVendorPricing;
    vm.openSystem = openSystem;
    vm.openSystemMessage = {};
    vm.openSystemDialogComplete = openSystemDialogComplete;

    activate();

    function activate(){
        notificationTemplateService.load('notification-template-open-system')
            .then(function(openSystemTemplate){
                vm.openSystemMessage.subject = openSystemTemplate.subject;
                vm.openSystemMessage.message = openSystemTemplate.emailBody;
            });
    }


    function undoCloseVendorPricing(){
        return vm.cycleRouter.previous();
    }

    function openSystem(){
        //modal submit calls openSystemDialogComplete
        $('#open-system-modal').modal('show');
    }

    function openSystemDialogComplete(){
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
