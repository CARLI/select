angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( notificationService ){
    var vm = this;

    activate();
    console.log('notificationsController init');

    function activate(){
        console.log('notificationsController activate');

        notificationService.listDrafts().then(function(drafts){
            vm.draftNotifications = drafts;
            console.log('got drafts', vm.draftNotifications);
        });

        notificationService.listSent().then(function(sent){
            vm.sentNotifications = sent;
            console.log('got drafts', vm.sentNotifications);
        });
    }
}
