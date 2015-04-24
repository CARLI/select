angular.module('carli.sections.notifications')
.controller('notificationsController', notificationsController);

function notificationsController( $scope, notificationService, notificationTemplateService ){
    var vm = this;

    activate();


    function activate(){
        loadNotificationTemplates();
    }

    function loadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }
}
