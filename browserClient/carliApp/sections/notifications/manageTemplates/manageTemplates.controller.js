angular.module('carli.sections.notifications.manageTemplates')
.controller('manageTemplatesController', manageTemplatesController);

function manageTemplatesController( notificationTemplateService ){
    var vm = this;
    vm.notificationTemplates = [];
    vm.templateToEdit = null;

    activate();

    function activate(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }

}
