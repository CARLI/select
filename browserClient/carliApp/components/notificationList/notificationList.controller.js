angular.module('carli.notificationList')
.controller('notificationListController', notificationListController);

function notificationListController($q, alertService, controllerBaseService, notificationService, notificationPreviewModalService){
    var vm = this;
    vm.filter = 'all';

    vm.filterByType = filterByType;
    vm.previewNotification = previewNotification;
    vm.previewPdf = previewPdf;
    vm.removeDraft = removeDraft;
    vm.sendNotification = sendNotification;
    vm.sendAllDrafts = sendAllDrafts;

    controllerBaseService.addSortable(vm, vm.defaultSort || 'subject');

    activate();

    function activate(){
        setupTemplateConfigurationForMode();
        loadNotifications();

        function setupTemplateConfigurationForMode(){
            vm.mode = vm.mode || 'draft';
            if ( vm.mode === 'sent' ){
                vm.showRemove = false;
                vm.showDateSent = true;
                vm.showSendAll = false;
                vm.sendLabel = 'Resend';
                vm.showDateFilter = true;
            }
            else {
                vm.showRemove = true;
                vm.showDateSent = false;
                vm.showSendAll = true;
                vm.sendLabel = 'Send';
                vm.showDateFilter = false;
            }
        }
    }

    function loadNotifications(){
        if ( vm.mode === 'sent' ){
            notificationService.listSent().then(function(sent){
                vm.notifications  = sent;
            });
        }
        else {
            notificationService.listDrafts().then(function(drafts){
                vm.notifications  = drafts;
            });
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
        notificationPreviewModalService.sendShowPreviewMessage(notification);
    }

    function previewPdf( notification ){
        alert('TODO: show PDF');
    }

    function removeDraft( notification ){
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
            alertService.putAlert(err, {severity: 'danger'});
        }
    }

    function removeNotificationFromVm( notificationToRemove ){
        vm.notifications = vm.notifications.filter(function(notification){
            return notification !== notificationToRemove;
        });
    }

    function sendAllDrafts(){
        var sendPromises = vm.notifications.map(sendNotificationSilently);

        $q.all(sendPromises)
            .then(function(results){
                alertService.putAlert( results.length + ' notifications sent', {severity: 'success'});

                if ( typeof vm.afterSendCallback === 'function' ){
                    vm.afterSendCallback();
                }
            })
            .catch(function(error){
                alertService.putAlert(error, {severity: 'danger'});

                if ( typeof vm.afterSendCallback === 'function' ){
                    vm.afterSendCallback();
                }
            });

        function sendNotificationSilently(notification){
            return notificationService.sendNotification(notification);
        }
    }

}
