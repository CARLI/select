angular.module('carli.sections.subscriptions.carliCheckingPrices')
    .controller('carliCheckingPricesController', carliCheckingPricesController);

function carliCheckingPricesController( $q, authService, config, notificationService, notificationTemplateService, userService ) {
    var vm = this;
    vm.doNotCreateNotification = false;
    vm.undoCloseVendorPricing = undoCloseVendorPricing;
    vm.openSystem = openSystem;
    vm.openSystemMessage = {};
    vm.openSystemDialogComplete = openSystemDialogComplete;
    vm.userName = '';
    vm.userEmail = '';
    vm.userIsReadonly = userService.userIsReadOnly();

    activate();

    function activate(){
        vm.doNotCreateNotification = false;

        loadUserInfo()
            .then(function(){
                return notificationTemplateService.load('notification-template-open-system');
            })
            .then(function(openSystemTemplate){
                vm.openSystemMessage.to = config.notifications.carliListServe;
                vm.openSystemMessage.subject = openSystemTemplate.subject;
                vm.openSystemMessage.emailBody = openSystemTemplate.emailBody;
                vm.openSystemMessage.draftStatus = 'draft';
                vm.openSystemMessage.notificationType = openSystemTemplate.notificationType;
                vm.openSystemMessage.dateCreated = new Date().toISOString().substr(0,16); //we don't care about second resolution
                vm.openSystemMessage.ownerEmail = vm.userEmail;
                vm.openSystemMessage.ownerName = vm.userName;
            });
    }

    function loadUserInfo() {
        return authService.fetchCurrentUser()
            .then(function (user) {
                vm.userName = user.fullName;
                vm.userEmail = user.email;
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
                    Logger.log('Created open system notification');
                })
                .catch(function(err){
                    Logger.log('error creating open system not',err);
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
