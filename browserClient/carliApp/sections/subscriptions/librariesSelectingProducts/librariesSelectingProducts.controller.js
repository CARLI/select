angular.module('carli.sections.subscriptions.librariesSelectingProducts')
    .controller('librariesSelectingProductsController', librariesSelectingProductsController);

function librariesSelectingProductsController( $q, alertService, cycleService, notificationModalService, userService ) {
    var vm = this;
    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.undoOpenSystem = undoOpenSystem;
    vm.closeSystem = closeSystem;
    vm.closeSystemDialogComplete = closeSystemDialogComplete;

    vm.sendReminder = sendReminder;
    vm.estimateAllLibraries = estimateAllLibraries;

    activate();


    function activate(){
        vm.cycle = cycleService.getCurrentCycle();
    }

    function undoOpenSystem(){
        return vm.cycleRouter.previous();
    }

    function closeSystem(){
        //modal submit calls openSystemDialogComplete
        $('#close-system-modal').modal('show');
    }

    function closeSystemDialogComplete(){
        return closeModal().then(vm.cycleRouter.next);
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

    function sendReminder(){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-library-reminder',
            cycleId: vm.cycle.id
        });
    }

    function estimateAllLibraries(){
        notificationModalService.sendStartDraftMessage({
            templateId: 'notification-template-library-estimates-open',
            cycleId: vm.cycle.id
        });
    }
}
