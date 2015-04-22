angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( notificationService, notificationTemplateService ){
    var vm = this;
    vm.draftNotifications = [];
    vm.sentNotifications = [];

    vm.sendAllDrafts = sendAllDrafts;

    activate();


    function activate(){
        loadNotificationTemplates();
    }

    function loadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }

    function sendAllDrafts(){
        console.log('sendAllDrafts');
    }
}
