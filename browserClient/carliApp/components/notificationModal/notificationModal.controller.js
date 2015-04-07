angular.module('carli.notificationModal')
.controller('notificationModalController', notificationModalController);

function notificationModalController($q, $scope, $rootScope, alertService, cycleService, libraryService, notificationService, notificationModalService, notificationTemplateService, offeringService, productService, vendorService) {
    var vm = this;
    var generator = null;

    vm.draft = {};
    vm.recipients = [];
    vm.template = null;

    vm.saveNotifications = saveNotifications;
    vm.useTemplate = useTemplate;

    activate();

    function activate(){
        $scope.$watch(notificationModalService.receiveStartDraftMessage, receiveStartDraftMessage);
        setupModalClosingUnsavedChangesWarning();
    }

    function keepCustomTemplates(template) {
        return template.type === 'other';
    }

    function useTemplate(){
        initializeDraftFromTemplate( vm.template );
    }

    function initializeDraftFromTemplate( template ){
        vm.template = template;

        vm.draft = {
            subject: template.subject,
            emailBody: template.emailBody,
            pdfBody: template.hasOwnProperty('pdfBody') ? template.pdfBody : '',
            draftStatus: 'draft',
            notificationType: template.notificationType
        };

        return vm.draft;
    }

    /*
     * Possible properties for message spec object:
     *
         {
            templateId: '',
            cycleId: '',
            recipientId: '',
            offeringIds: []
         }
     */
    function receiveStartDraftMessage(message) {
        if (!message) {
            return;
        } else {
            notificationModalService.acknowledgeStartDraftMessage();
        }

        notificationTemplateService.load(message.templateId)
            .then(initializeDraftFromTemplate)
            .then(populateRecipients)
            .then(showModal)
            .catch(function (err) {
                console.log(err);
            });

        function populateRecipients(draftNotification) {
            generator = notificationService.generateDraftNotification(vm.template, message);
            return generator.getRecipients().then(function (recipients) {
                vm.recipients = recipients;
                return draftNotification;
            });
        }

        function showModal() {
            console.log('Draft',vm.draft);
            $('#notification-modal').modal();
        }
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

            return getNotifications(vm.draft, recipientIds)
                .then(function (notifications) {
                    console.log(notifications);
                    var promises = notifications.map(notificationService.create);
                    return $q.all(promises);
                })
                .then(saveSuccess)
                .catch(saveError);

            function getRecipientIds(recipients) {
                return recipients.map(function (r) { return r.id.toString(); });
            }
        }

        function saveNotificationFromForm(){
            vm.draft.to = vm.recipients.map(function (r) { return r.label; }).join(', ');
            return notificationService.create(vm.draft)
            .then(saveSuccess)
            .catch(saveError);
        }

        function saveSuccess(results){
            var message = angular.isArray(results) ? results.length + ' Notifications created' : 'Notification created';
            alertService.putAlert(message, {severity: 'success'});
            resetNotificationForm();
            hideModal();
            if ( typeof vm.afterSubmitFn === 'function' ){
                vm.afterSubmitFn();
            }
        }

        function saveError(error) {
            alertService.putAlert(error, {severity: 'danger'});
        }
    }
}