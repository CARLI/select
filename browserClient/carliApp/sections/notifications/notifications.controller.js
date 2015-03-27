angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( notificationService, notificationTemplateService ){
    var vm = this;
    vm.draftNotifications = [];
    vm.sentNotifications = [];

    vm.loadNotifications = loadNotifications;
    vm.sendAllDrafts = sendAllDrafts;

    activate();


    function activate(){
        loadNotifications();
        loadNotificationTemplates();
    }

    function loadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }

    function loadNotifications(){
        notificationService.listDrafts().then(function(drafts){
            vm.draftNotifications = drafts;
        });

        notificationService.listSent().then(function(sent){
            vm.sentNotifications = sent;
        });
    }

    function sendAllDrafts(){
        console.log('sendAllDrafts');
    }
}
