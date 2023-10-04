angular.module('carli.notificationList')
.controller('notificationListController', notificationListController);

function notificationListController($q, $scope, $rootScope, $filter, $window, alertService, authService, config, controllerBaseService, errorHandler, notificationService, notificationModalService, notificationPreviewModalService){
    var vm = this;

    var datePickerFormat = 'M/D/YY';
    var sendFunction = function(){};
    var postSendFunction = function(){};

    vm.apiPath = config.getMiddlewareUrl();
    vm.filter = 'all';
    vm.ownerFilterEnabled = false;

    vm.disableOwnerFilter = disableOwnerFilter;
    vm.enableOwnerFilter = enableOwnerFilter;
    vm.previewCsv = previewCsv;
    vm.filterByOwner = filterByOwner;
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
    vm.userHasNoDrafts = userHasNoDrafts;

    controllerBaseService.addSortable(vm, '-dateCreated');

    activate();

    function activate(){
        setupTemplateConfigurationForMode();
        vm.loadingPromise = loadUserInfo().then(loadNotifications);

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
                sendFunction = notificationService.resend;
            }
            else {
                vm.orderBy = ['-dateCreated','targetEntity.name'];
                vm.showRemove = true;
                vm.showDateSent = false;
                vm.showSendAll = true;
                vm.sendLabel = 'Send';
                vm.showDateFilter = false;
                vm.showView = false;
                vm.showEdit = true;
                sendFunction = notificationService.sendNotification;
                postSendFunction = function(){
                    announceNotificationsChange('draftSent');
                };
            }
        }

        listenForNotificationChanges();
    }

    function loadUserInfo() {
        return authService.fetchCurrentUser().then(function (user) {
            vm.userName = user.fullName;
            vm.userEmail = user.email;
        });
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
            else if ( args === 'draftEdited' ){
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

    function filterByOwner(notification, index){
        if ( vm.ownerFilterEnabled){
            return currentUserOwnsNotification(notification);
        }
        else {
            return true;
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
        sendFunction(notification)
            .then(notificationSentSuccess)
            .then(postSendFunction)
            .catch(errorHandler);

        function notificationSentSuccess(){
            alertService.putAlert('Notification sent', {severity: 'success'});
        }
    }

    function removeNotificationFromVm( notificationToRemove ){
        vm.notifications = vm.notifications.filter(function(notification){
            return notification !== notificationToRemove;
        });
    }

    async function sendAllDrafts(){
        var notifications = listOwnNotifications();
        var notificationsToSend = listOwnNotifications();

        do {
            try {
                await sendNotificationSilently(notificationsToSend[0]);
                notificationsToSend.shift();
                console.log(`Success! ${notificationsToSend.length} notifications left to send.`);
                if(notificationsToSend.length % 10 == 0) {
                    alertService.putAlert( notificationsToSend.length + ' notifications left to send', {severity: 'success'});
                }
            }
            catch(e) {

            }
        } while(notificationsToSend.length > 0)

        var s = notifications.length === 1 ? '' : 's';
        alertService.putAlert( notifications.length + ' notification'+s + ' sent', {severity: 'success'});
        announceNotificationsChange('draftSent');

        function sendNotificationSilently(notification){
            if ( notification.ownerEmail === vm.userEmail ) {
                return notificationService.sendNotification(notification);
            }
            else {
                return $q.when();
            }
        }
    }

    function deleteAllDrafts(){
        return $q.all(listOwnNotifications().map(function(notification){
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

    function listOwnNotifications(){
        return vm.notifications.filter(currentUserOwnsNotification);
    }

    function currentUserOwnsNotification(notification){
        return notification.ownerEmail === vm.userEmail;
    }

    function userHasNoDrafts(){
        return listOwnNotifications().length === 0;
    }

    function disableOwnerFilter(){
        vm.ownerFilterEnabled = false;
    }

    function enableOwnerFilter(){
        vm.ownerFilterEnabled = true;
    }
}
