angular.module('carli.notificationList')
.controller('notificationListController', notificationListController);

function notificationListController(controllerBaseService){
    var vm = this;
    vm.filter = 'all';
    vm.previewNotification = previewNotification;
    vm.previewPdf = previewPdf;
    vm.removeDraft = removeDraft;
    vm.sendNotification = sendNotification;

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

    function previewNotification( notification ){
        console.log('preview notification', notification);
    }

    function previewPdf( notification ){
        console.log('preview pdf for ',notification);
    }

    function removeDraft( notification ){
        console.log('removeDraft ',notification);
    }

    function sendNotification( notification ){
        console.log('send ',notification);
    }

}
