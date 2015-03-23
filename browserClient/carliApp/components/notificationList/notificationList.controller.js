angular.module('carli.notificationList')
.controller('notificationListController', notificationListController);

function notificationListController(controllerBaseService){
    var vm = this;

    controllerBaseService.addSortable(vm, vm.defaultSort || 'subject');

    activate();

    function activate(){
        setupTemplateConfigurationForMode();


        function setupTemplateConfigurationForMode(){
            var mode = vm.mode || 'drafts';
            if ( mode === 'sent' ){
                vm.showRemove = false;
                vm.showDateSent = true;
                vm.sendLabel = 'Resend';
            }
            else {
                vm.showRemove = true;
                vm.showDateSent = false;
                vm.sendLabel = 'Send';
            }
        }
    }

}
