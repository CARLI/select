angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesController', carliCheckingPricesController);

function carliCheckingPricesController( $q, notificationService, notificationTemplateService ) {
    var vm = this;
    vm.doNotCreateNotification = false;
    vm.undoCloseVendorPricing = undoCloseVendorPricing;
    vm.openSystem = openSystem;
    vm.openSystemMessage = {};
    vm.openSystemDialogComplete = openSystemDialogComplete;

    activate();

    function activate(){
        vm.doNotCreateNotification = false;

        notificationTemplateService.load('notification-template-open-system')
            .then(function(openSystemTemplate){
                vm.openSystemMessage.subject = openSystemTemplate.subject;
                vm.openSystemMessage.emailBody = openSystemTemplate.emailBody;
                vm.openSystemMessage.draftStatus = 'draft';
                vm.openSystemMessage.notificationType = openSystemTemplate.notificationType;
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
        if (!vm.doNotCreateNotification) {
            notificationService.create(vm.openSystemMessage)
                .then(function(){
                    console.log('Created open system notification');
                })
                .catch(function(err){
                    console.log('error creating open system not',err);
                });
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
