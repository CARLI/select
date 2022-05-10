angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( notificationModalService, notificationTemplateService , userService ){
    var vm = this;

    vm.userIsReadOnly = userService.userIsReadOnly();
    vm.newDraftTemplate = null;
    vm.showTemplateChooser = showTemplateChooser;
    vm.startDraft = startDraft;

    activate();


    function activate(){
        loadNotificationTemplates();
    }

    function loadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }

    function startDraft(){
        hideTempalateChooser();
        notificationModalService.sendStartDraftMessage( vm.newDraftTemplate );
        vm.newDraftTemplate = null;
    }

    function hideTempalateChooser(){
        $('#template-chooser').modal('hide');
    }

    function showTemplateChooser(){
        $('#template-chooser').modal();
    }
}
