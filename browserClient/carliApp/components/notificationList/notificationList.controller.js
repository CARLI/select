angular.module('carli.notificationList')
.controller('notificationListController', notificationListController);

function notificationListController($q, $scope, $rootScope, $filter, $window, alertService, config, controllerBaseService, errorHandler, notificationService, notificationModalService, notificationPreviewModalService){
    var vm = this;

    var datePickerFormat = 'M/D/YY';

    vm.apiPath = config.getMiddlewareUrl();
    vm.defaultSort = 'dateCreated';
    vm.filter = 'all';

    vm.previewCsv = previewCsv;
    vm.filterByType = filterByType;
    vm.updateNotifications = updateNotifications;
    vm.previewNotification = previewNotification;
    vm.previewPdf = previewPdf;
    vm.removeDraft = removeDraft;
    vm.sendNotification = sendNotification;
    vm.sendAllDrafts = sendAllDrafts;
    vm.deleteAllDrafts = deleteAllDrafts;
    vm.formatSummaryTotal = formatSummaryTotal;
    vm.editDraft = editDraft;

    controllerBaseService.addSortable(vm, vm.defaultSort || 'dateCreated');

    activate();

    function activate(){
        setupTemplateConfigurationForMode();
        vm.loadingPromise = loadNotifications();

        function setupTemplateConfigurationForMode(){
            vm.mode = vm.mode || 'draft';
            if ( vm.mode === 'sent' ){
                vm.orderBy = 'dateSent';
                vm.showRemove = false;
                vm.showDateSent = true;
                vm.showSendAll = false;
                vm.sendLabel = 'Resend';
                vm.showDateFilter = true;
                vm.showView = true;
                vm.showEdit = false;
                vm.sentFilterStartDate = moment().subtract(2,'week').format();
                vm.sentFilterEndDate = moment().endOf('day').format();
            }
            else {
                vm.orderBy = 'dateCreated';
                vm.showRemove = true;
                vm.showDateSent = false;
                vm.showSendAll = true;
                vm.sendLabel = 'Send';
                vm.showDateFilter = false;
                vm.showView = false;
                vm.showEdit = true;
            }
        }

        listenForNotificationChanges();
    }

    function listenForNotificationChanges(){
        $scope.$on('notificationsUpdated', function(event, args){
            if ( args === 'draftCreated' && vm.mode === 'draft' ){
                updateNotifications();
            }
            else if ( args === 'draftSent' ){
                /* This causes both the drafts list and the sent list to reload each time 'send draft' is clicked.
                 * This is the quick and easy solution to updating the lists when that happens. If those lists are big
                 * and slow to load this could be a pain. A better approach would be to also broadcast the id of the
                 * notification that changed and then specifically remove it from both lists.
                 */
                updateNotifications();
            }
        });
    }

    function updateNotifications(){
        vm.loadingPromise = loadNotifications();
    }

    function loadNotifications(){
        if ( vm.mode === 'sent' ){
            var startDate = moment(vm.sentFilterStartDate).format();
            var endDate = moment(vm.sentFilterEndDate).endOf('day').format();

            return notificationService.listSentBetweenDates(startDate, endDate).then(function(sent){
                vm.notifications  = sent;
            });
        }
        else {
            return notificationService.listDrafts().then(function(drafts){
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

    function editDraft( notification ){
        notificationModalService.sendEditDraftMessage(notification);
    }

    function previewNotification( notification ){
        notificationPreviewModalService.sendShowPreviewMessage(notification);
    }

    function previewPdf( notification ){
        //$window.open( vm.apiPath + notification.pdfLink );
        var pdfLink = '/pdf/content/' + notification.id;
        $window.open( vm.apiPath + pdfLink );
    }

    function previewCsv( notification ){
        //$window.open( vm.apiPath + notification.csvLink );
        var csvLink = '/csv/export/' + notification.id;
        $window.open( vm.apiPath + csvLink );
    }

    function removeDraft( notification ){
        notificationService.removeNotification(notification.id)
            .then(notificationRemovedSuccess)
            .catch(errorHandler);

        function notificationRemovedSuccess(){
            removeNotificationFromVm(notification);
            alertService.putAlert('Notification removed', {severity: 'success'});
        }
    }

    function sendNotification( notification ){
        notificationService.sendNotification(notification)
            .then(notificationSentSuccess)
            .catch(errorHandler);

        function notificationSentSuccess(){
            alertService.putAlert('Notification sent', {severity: 'success'});
            announceNotificationsChange('draftSent');
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
                announceNotificationsChange('draftSent');
            })
            .catch(errorHandler);

        function sendNotificationSilently(notification){
            return notificationService.sendNotification(notification);
        }
    }

    function deleteAllDrafts(){
        return $q.all(vm.notifications.map(function(notification){
                return notificationService.delete(notification.id);
            }))
            .then(function(){
                announceNotificationsChange('draftSent');
            });
    }

    function formatSummaryTotal( summaryTotal ){
        if ( typeof summaryTotal === 'number' ){
            return summaryTotalString( $filter('currency')(summaryTotal) );
        }
        return '';


        function summaryTotalString( amount ){
            return '- (' + amount + ')';
        }
    }

    function announceNotificationsChange( typeOfChange ){
        $rootScope.$broadcast('notificationsUpdated', typeOfChange);
    }
}
