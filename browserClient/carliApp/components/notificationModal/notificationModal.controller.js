angular.module('carli.notificationModal')
.controller('notificationModalController', notificationModalController);

function notificationModalController($q, $filter, $rootScope, $scope, alertService, errorHandler, notificationService, notificationModalService, notificationTemplateService) {
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
            id: template.id,
            subject: template.subject,
            emailBody: template.emailBody,
            pdfBefore: template.hasOwnProperty('pdfBefore') ? template.pdfBefore : '',
            pdfAfter:  template.hasOwnProperty('pdfAfter') ? template.pdfAfter : '',
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

        showLoadingDataModal();

        notificationTemplateService.load(message.templateId)
            .then(initializeDraftFromTemplate)
            .then(populateRecipients)
            .then(showEditDraftModal)
            .catch(function (err) {
                console.log(err);
            });

        function populateRecipients(draftNotification) {
            generator = notificationService.generateDraftNotification(vm.template, message);
            return generator.getRecipients().then(function (recipients) {
                vm.recipients = $filter('orderBy')(recipients, 'label');
                return draftNotification;
            });
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
                    var promises = notifications.map(notificationService.create);
                    return $q.all(promises);
                })
                .then(saveSuccess)
                .catch(errorHandler);

            function getRecipientIds(recipients) {
                return recipients.map(function (r) { return r.id.toString(); });
            }
        }

        function saveNotificationFromForm(){
            vm.draft.to = vm.recipients.map(function (r) { return r.label; }).join(', ');
            return notificationService.create(vm.draft)
            .then(saveSuccess)
            .catch(errorHandler);
        }

        function saveSuccess(results){
            var message = angular.isArray(results) ? results.length + ' Notifications created' : 'Notification created';
            alertService.putAlert(message, {severity: 'success'});
            $rootScope.$broadcast('notificationsUpdated', 'draftCreated');
            resetNotificationForm();
            hideModal();
            if ( typeof vm.afterSubmitFn === 'function' ){
                vm.afterSubmitFn();
            }
        }
    }
}
