angular.module('carli.manageNotificationTemplatesModal')
.controller('manageNotificationTemplatesModalController', manageNotificationTemplatesModalController);

function manageNotificationTemplatesModalController( $scope, $rootScope, alertService, notificationTemplateService ){
    var vm = this;
    vm.notificationTemplates = [];
    vm.templateToEdit = null;

    vm.saveTemplate = save;

    activate();


    function activate(){
        loadNotificationTemplates();
        setupModalClosingUnsavedChangesWarning();
    }

    function loadNotificationTemplates(){
        notificationTemplateService.list().then(function(notificationTemplates){
            vm.notificationTemplates = notificationTemplates;
        });
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#manage-notifications-templates-modal').on('hide.bs.modal', confirmHideModal);
    }

    function save(){
        notificationTemplateService.update(vm.templateToEdit)
            .then(successfulSave)
            .catch(errorSaving);

        function successfulSave(){
            alertService.putAlert('Template updated', {severity: 'success'});
            resetTemplateForm();
            hideModal();
        }

        function errorSaving( error ){
            alertService.putAlert(error, {severity: 'danger'});
        }
    }

    function resetTemplateForm(){
        setTemplateFormPristine();
        vm.templateToEdit = null;
        loadNotificationTemplates();
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

}
