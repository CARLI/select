angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( notificationService ){
    var vm = this;
    vm.draftNotifications = [];
    vm.sentNotifications = [];

    activate();

    function activate(){
        notificationService.listDrafts().then(function(drafts){
            vm.draftNotifications = drafts;
        });

        notificationService.listSent().then(function(sent){
            vm.sentNotifications = sent;
        });
    }
}
