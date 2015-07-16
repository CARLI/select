angular.module('carli.manageNotificationTemplatesModal')
.controller('manageNotificationTemplatesModalController', manageNotificationTemplatesModalController);

function manageNotificationTemplatesModalController( $scope, $rootScope, alertService, errorHandler, notificationTemplateService ){
    var vm = this;
    vm.templateToEdit = null;
    vm.newTemplate = false;

    vm.addNewTemplate = addNewTemplate;
    vm.saveTemplate = save;
    vm.editingExistingTemplate = editingExistingTemplate;

    activate();


    function activate(){
        setupModalClosingUnsavedChangesWarning();
    }

    function reloadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.templates = notificationTemplates;
        });
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#manage-notifications-templates-modal').on('hide.bs.modal', confirmHideModal);
    }

    function save(){
        if ( vm.newTemplate ){
            notificationTemplateService.create(vm.templateToEdit)
                .then(function(){
                    successfulSave('Template created');
                })
                .catch(errorHandler);
        }
        else {
            notificationTemplateService.update(vm.templateToEdit)
                .then(function(){
                    successfulSave('Template updated');
                })
                .catch(errorHandler);
        }

        function successfulSave(message){
            alertService.putAlert(message, {severity: 'success'});
            resetTemplateForm();
            hideModal();
        }
    }

    function resetTemplateForm(){
        setTemplateFormPristine();
        vm.templateToEdit = null;
        vm.newTemplate = false;
        reloadNotificationTemplates();
    }

    function setTemplateFormPristine() {
        if ($scope.editTemplateForm) {
            $scope.editTemplateForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.editTemplateForm) {
            $rootScope.forms.editTemplateForm.$setPristine();
        }
    }

    function hideModal(){
        $('#manage-notifications-templates-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( templateFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetTemplateForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function templateFormIsDirty(){
        if ($scope.editTemplateForm) {
            return $scope.editTemplateForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.editTemplateForm) {
            return $rootScope.forms.editTemplateForm.$dirty;
        }
        return false;
    }

    function addNewTemplate(){
        vm.newTemplate = true;
        vm.templateToEdit = {
            name: 'New Template',
            subject: '',
            emailBody: '',
            pdfBefore: '',
            pdfAfter: '',
            pdfContentIsEditable: false,
            notificationType: 'other'
        };
    }

    function editingExistingTemplate(){
        vm.newTemplate = false;
    }

}
