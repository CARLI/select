angular.module('carli.notificationModal')
.controller('notificationModalController', notificationModalController);

function notificationModalController($scope, $rootScope, alertService, cycleService, libraryService, notificationService, notificationModalService, notificationTemplateService, offeringService, productService, vendorService) {
    var vm = this;
    vm.draft = {};
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
            recipients: [],
            subject: template.subject,
            emailBody: template.emailBody,
            pdfBody: '',
            isPdfContentEditable: template.isPdfContentEditable,
            draftStatus: 'draft',
            notificationType: template.notificationType
        };

        if (template.hasOwnProperty('pdfBody')) {
            vm.draft.pdfBody = template.pdfBody;
        }

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
        }

        notificationTemplateService.load(message.templateId)
            .then(initializeDraftFromTemplate)
            .then(populateRecipients)
            .then(prepareDraftDataForEditForm)
            .then(showModal)
            .catch(function (err) {
                console.log(err);
            });

        function populateRecipients(draftNotification) {
            var generator = notificationService.generateDraftNotification(vm.template, message);
            return generator.getRecipients().then(function (recipients) {
                draftNotification.recipients = recipients;
                return draftNotification;
            });
        }

        function prepareDraftDataForEditForm( draftNotification ){
            draftNotification.to = draftNotification.recipients.map(getLabel).join(', ');

            function getLabel( recipient ){
                return recipient.label;
            }

            console.log('Draft',draftNotification);
            return draftNotification;
        }

        function showModal() {
            $('#notification-modal').modal();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#notification-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetNotificationForm(){
        vm.draft = {};
        vm.template = null;
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

    function saveNotifications(){
        notificationService.createNotificationsFor( vm.draft )
            .then(saveSuccess)
            .catch(saveError);

        function saveSuccess(){
            alertService.putAlert('Notifications created', {severity: 'success'});
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
