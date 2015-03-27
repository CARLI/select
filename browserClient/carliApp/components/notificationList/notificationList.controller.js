angular.module('carli.notificationList')
.controller('notificationListController', notificationListController);

function notificationListController(alertService, controllerBaseService, notificationService){
    var vm = this;
    vm.filter = 'all';

    vm.filterByType = filterByType;
    vm.previewNotification = previewNotification;
    vm.previewPdf = previewPdf;
    vm.removeDraft = removeDraft;
    vm.sendNotification = sendNotification;

    controllerBaseService.addSortable(vm, vm.defaultSort || 'subject');

    activate();

    function activate(){
        setupTemplateConfigurationForMode();

        function setupTemplateConfigurationForMode(){
            vm.mode = vm.mode || 'draft';
            if ( vm.mode === 'sent' ){
                vm.showRemove = false;
                vm.showDateSent = true;
                vm.showSendAll = false;
                vm.sendLabel = 'Resend';
            }
            else {
                vm.showRemove = true;
                vm.showDateSent = false;
                vm.showSendAll = true;
                vm.sendLabel = 'Send';
            }
        }
    }

    function filterByType(value, index){
        if ( vm.filter === 'all' ){
            return true;
        }

        if ( value ){
            return value.notificationType === vm.filter;
        }

        return false;
    }

    function previewNotification( notification ){
        console.log('preview notification', notification);
    }

    function previewPdf( notification ){
        console.log('preview pdf for ',notification);
    }

    function removeDraft( notification ){
        console.log('removeDraft ',notification);

        notificationService.removeNotification(notification.id)
            .then(notificationRemovedSuccess)
            .catch(notificationRemovedError);

        function notificationRemovedSuccess(){
            removeNotificationFromVm(notification);
            alertService.putAlert('Notification removed', {severity: 'success'});
        }

        function notificationRemovedError(err){
            alertService.putAlert(error, {severity: 'danger'});
        }
    }

    function sendNotification( notification ){
        notificationService.sendNotification(notification)
            .then(notificationSentSuccess)
            .catch(notificationSentError);

        function notificationSentSuccess(){
            if ( typeof vm.afterSendCallback === 'function' ){
                vm.afterSendCallback();
            }
            alertService.putAlert('Notification sent', {severity: 'success'});
        }

        function notificationSentError(err){
            alertService.putAlert(error, {severity: 'danger'});
        }
    }

    function removeNotificationFromVm( notificationToRemove ){
        vm.notifications = vm.notifications.filter(function(notification){
            return notification !== notificationToRemove;
        });
    }

}
