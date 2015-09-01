angular.module('carli.notificationModal')
.controller('notificationModalController', notificationModalController);

function notificationModalController($q, $filter, $rootScope, $scope, alertService, authService, bannerService, browserDownloadService, errorHandler, notificationService, notificationModalService, notificationTemplateService) {
    var vm = this;
    var generator = null;

    vm.contactsPromise = $q.when([]);
    vm.draft = {};
    vm.recipients = [];
    vm.recipientsEditable = true;
    vm.template = null;
    vm.userName = '';
    vm.userEmail = '';

    vm.autocompleteContacts = autocompleteContacts;
    vm.cancel = cancel;
    vm.removeRecipient = removeRecipient;
    vm.saveNotifications = saveNotifications;

    activate();

    function activate(){
        $scope.$watch(notificationModalService.receiveStartDraftMessage, receiveStartDraftMessage);
        $scope.$watch(notificationModalService.receiveEditDraftMessage, receiveEditDraftMessage);
        setupModalClosingUnsavedChangesWarning();
        loadUserInfo();
        loadAllContacts();
    }

    function loadUserInfo() {
        authService.fetchCurrentUser().then(function (user) {
            vm.userName = user.fullName;
            vm.userEmail = user.email;
        });
    }

    function loadAllContacts(){
        vm.contactsPromise = notificationService.listAllContacts()
            .then(extractContactObjectsFromContacts)
            .catch(function(err){
                console.warn('error loading contacts',err);
            });

        return vm.contactsPromise;

        function extractContactObjectsFromContacts(allContacts) {
            return allContacts.map(convertContactToRecipientTag);
        }
    }

    function initializeDraftFromTemplate( template ){
        vm.template = template;

        vm.draft = {
            templateId: template.id,
            subject: template.subject,
            emailBody: template.emailBody,
            notificationType: template.notificationType,
            draftStatus: 'draft'
        };

        var recipientsEditable = notificationService.notificationTypeAllowsRecipientsToBeEdited(template.notificationType);
        vm.recipientsEditable = recipientsEditable ? 'yes' : 'remove-only';

        return vm.draft;
    }

    function initializeDraftFromNotification( notification ){
        vm.template = null;

        vm.draft = notification;

        var recipientsEditable = notificationService.notificationTypeAllowsRecipientsToBeEdited(notification.notificationType);
        vm.recipientsEditable = recipientsEditable ? 'yes' : 'read-only';

        vm.recipientLabel = notification.getRecipientLabel();

        $q.when(notification.getRecipientEmailAddresses())
            .then(function(emailAddresses){
                if ( emailAddresses && emailAddresses.length ){
                    vm.recipientEmail = '(' + emailAddresses + ')';
                }
                else {
                    vm.recipientEmail = '(No contacts added!)';
                }
            });

        return vm.draft;
    }

    /* Drafts can be started from subscription screens (invoices, reminders, and reports) or from the list screen
     * with the 'Draft Message' button. In the former case, the start draft message is a set of data that determines
     * who the recipients are and what the pricing / selection data is. The recipient are not editable in this case.
     * The second case has no automatically generated data, so the recipients are completely free-form email addresses.
     *
     * Possible properties for message spec object from a subscription screen:
     *
     *   {
     *      templateId: '',
     *      cycleId: '',
     *      recipientId: '',
     *      offeringIds: [],
     *   }
     *
     *   from the 'Draft Message' button the chosen notification template is passed in.
     */
    function receiveStartDraftMessage(message) {
        if (!message) {
            return;
        } else {
            notificationModalService.acknowledgeStartDraftMessage();
        }

        var manualDraft = isMessageForManualDraft();

        showLoadingDataModal();

        loadTemplate()
            .then(initializeDraftFromTemplate)
            .then(populateRecipients)
            .then(showEditDraftModal)
            .catch(function (err) {
                console.log(err);
            });


        function isMessageForManualDraft(){
            return message.type === "NotificationTemplate";
        }

        function loadTemplate(){
            if ( manualDraft ){
                return $q.when(message);
            }
            else {
                return notificationTemplateService.load(message.templateId);
            }
        }

        function populateRecipients(draftNotification) {
            if ( manualDraft ){
                generator = null;
                vm.recipients = [];
                return draftNotification;
            }
            else {
                generator = notificationService.generateDraftNotification(vm.template, message);

                return generator.getRecipients()
                    .then(function (recipients) {
                        vm.recipients = $filter('orderBy')(recipients, 'label');
                        return draftNotification;
                    });
            }
        }

        function showEditDraftModal() {
            $('#notification-modal').modal('show');
            hideLoadingDataModal();
        }

        function showLoadingDataModal(){
            $('#notification-loading-modal').modal({
                backdrop: 'static',
                keyboard: false
            });
        }

        function hideLoadingDataModal(){
            $('#notification-loading-modal').modal('hide');
        }
    }

    function receiveEditDraftMessage( notification ){
        if (!notification) {
            return;
        } else {
            notificationModalService.acknowledgeEditDraftMessage();
        }

        initializeDraftFromNotification(notification);
        vm.recipients = convertToStringToRecipientObjects(notification.to);

        generator = null;

        $('#notification-modal').modal('show');
    }

    function isNotificationGeneratedFromData(){
        return generator;
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#notification-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetNotificationForm(){
        vm.draft = {};
        vm.template = null;
        generator = null;
        setNotificationFormPristine();
    }

    function setNotificationFormPristine() {
        if ($scope.notificationForm) {
            $scope.notificationForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.notificationForm) {
            $rootScope.forms.notificationForm.$setPristine();
        }
    }

    function hideModal() {
        $('#notification-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( notificationFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetNotificationForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function notificationFormIsDirty(){
        if ($scope.notificationForm) {
            return $scope.notificationForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.notificationForm) {
            return $rootScope.forms.notificationForm.$dirty;
        }
        return false;
    }

    function cancel(){
        if ( !notificationFormIsDirty() ){
            resetNotificationForm();
        }
        hideModal();
    }

    function getNotifications(editedTemplate, recipientIds) {
        return $q.when(generator.getNotifications(editedTemplate, recipientIds));
    }

    function saveNotifications(){
        if ( isNotificationGeneratedFromData() ) {
            return saveNotificationFromGenerator();
        }
        else {
            return saveNotificationFromForm();
        }

        function saveNotificationFromGenerator() {
            var recipientIds = getRecipientIds(vm.recipients);
            var batchId = null;
            var cycle = null;

            return getNotifications(vm.draft, recipientIds)
                .then(function (notifications) {
                    if (vm.draft.notificationType === 'invoice') {
                        batchId = notifications[0].batchId;
                        cycle = notifications[0 ].cycle;
                    }
                    notifications.forEach(addNotificationCreationInformation);
                    var promises = notifications.map(notificationService.create);
                    return $q.all(promises);
                })
                .then(downloadBannerExportForInvoices)
                .then(alertCreateSuccess)
                .catch(errorHandler);

            function getRecipientIds(recipients) {
                return recipients.map(function (r) { return r.id.toString(); });
            }

            function downloadBannerExportForInvoices(passthrough) {
                if (vm.draft.notificationType === 'invoice') {
                    return bannerService.downloadBannerExportForInvoices(cycle, batchId)
                        .then(function () {
                            return passthrough;
                        });
                } else {
                    return passthrough;
                }
            }
        }

        function saveNotificationFromForm(){
            vm.draft.to = convertRecipientTagsToString(vm.recipients);
            addNotificationCreationInformation(vm.draft);

            return saveNotification()
                .catch(errorHandler);

            function saveNotification(){
                if ( vm.draft.type === 'Notification' ){
                    return notificationService.update(vm.draft)
                        .then(function(){
                            alertService.putAlert('Notification draft edits saved', {severity: 'success'});
                            $rootScope.$broadcast('notificationsUpdated', 'draftEdited');
                            resetNotificationForm();
                            hideModal();
                        });
                }
                else {
                    return notificationService.create(vm.draft)
                        .then(alertCreateSuccess);
                }
            }
        }

        function alertCreateSuccess(results){
            var numberCreated = angular.isArray(results) ? results.length : 1;
            var s = numberCreated === 1 ? '' : 's';
            var message = numberCreated + ' Notification'+s +' created';
            alertService.putAlert(message, {severity: 'success'});
            $rootScope.$broadcast('notificationsUpdated', 'draftCreated');
            resetNotificationForm();
            hideModal();
            if ( typeof vm.afterSubmitFn === 'function' ){
                vm.afterSubmitFn();
            }
        }
    }

    function addNotificationCreationInformation(notification){
        notification.dateCreated = new Date().toISOString().substr(0,16); //we don't care about second resolution
        notification.ownerEmail = vm.userEmail;
        notification.ownerName = vm.userName;
    }

    function convertRecipientTagsToString( recipientArray ){
        return recipientArray.map(function (r) { return r.label; }).join(', ');
    }

    function convertToStringToRecipientObjects( toString ){
        if ( !toString ){
            return [];
        }
        return toString.split(',');
    }

    function convertContactToRecipientTag(contact){
        return {
            id: contact.email,
            label: contact.email,
            nameAndEmail: contact.name + ' ('+contact.email+')'
        };
    }

    function removeRecipient(index){
        vm.recipients.splice(index, 1);
    }

    function autocompleteContacts( textToMatch ){
        return vm.contactsPromise.then(filterContacts);

        function filterContacts(allContacts){
            return $filter('filter')(allContacts, textToMatch);
        }
    }
}
