angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( notificationService ){
    var vm = this;
    vm.draftNotifications = [];
    vm.sentNotifications = [];
    vm.sendAllDrafts = sendAllDrafts;

    activate();

    function activate(){
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
