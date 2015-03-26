angular.module('carli.notificationModal')
.controller('notificationModalController', notificationModalController);

function notificationModalController($scope, $rootScope, notificationService, notificationModalService, notificationTemplateService) {
    var vm = this;
    vm.draft = {};
    vm.template = null;

    vm.saveNotifications = saveNotifications;
    vm.useTemplate = useTemplate;

    activate();

    function activate(){
        loadNotificationTemplates();
        $scope.$watch(notificationModalService.receiveStartDraftMessage, receiveStartDraftMessage);
        setupModalClosingUnsavedChangesWarning();
    }

    function loadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }

    function useTemplate(){
        initializeDraftFromTemplate( vm.template );
    }

    function initializeDraftFromTemplate( template ){
        vm.template = template;

        vm.draft = {
            recipients: '',
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

    function receiveStartDraftMessage(message) {
        if (!message) {
            return;
        }

        notificationTemplateService.load(message.templateId)
            .then(initializeDraftFromTemplate)
            .then(showModal)
            .catch(function (err) {
                console.log(err);
            });

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
        if ($scope.editTemplateForm) {
            $scope.editTemplateForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.editTemplateForm) {
            $rootScope.forms.editTemplateForm.$setPristine();
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
        console.log('create notifications for ',vm.draft);
        notificationService.createNotificationsFor( vm.draft )
            .then(alertSuccess, alertError)
            .then(hideModal);

        function alertSuccess() {
            alert('it worked');
        }
        function alertError(err) {
            alert(err);
        }
    }
}