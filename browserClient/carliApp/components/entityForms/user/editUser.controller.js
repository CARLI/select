angular.module('carli.entityForms.user')
    .controller('editUserController', editUserController);

function editUserController( $scope, $rootScope, $q, alertService, authService, entityBaseService, userService  ) {
    var vm = this;

    var templates = {
        userFields: 'carliApp/components/entityForms/user/editUser.html'
    };
    vm.currentTemplate = templates.userFields;

    vm.userId = $scope.userId;
    vm.passwordConfirmation = '';
    var afterSubmitCallback = $scope.afterSubmitFn || function() {};

    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.saveUser = saveUser;
    vm.submitAction = submitAction;
    vm.submitLabel = submitLabel;


    vm.statusOptions = entityBaseService.getStatusOptions();

    setupModalClosingUnsavedChangesWarning();
    activate();

    function activate() {
        vm.isModal = vm.newUser;
        vm.isCurrentUser = false;

        if ($scope.userId === undefined) {
            return initializeForNewUser();
        }
        else {
            return initializeForExistingUser();
        }
    }

    function initializeForNewUser() {
        vm.editable = true;
        vm.newUser = true;

        vm.user = {
            type: 'user',
            email: '',
            password: '',
            isActive: true,
            roles: [ 'staff' ]
        };

        setUserFormPristine();

        return vm.user;
    }

    function initializeForExistingUser() {
        vm.editable = false;
        vm.newUser = false;

        return userService.load($scope.userId)
            .then(setUserOnVm)
            .then(determineIfUserIsCurrentUser);

        function setUserOnVm( user ) {
            vm.user = angular.copy(user);
            setUserFormPristine();
            return user;
        }

        function determineIfUserIsCurrentUser(userBeingEdited) {
            return authService.getCurrentUser().then(function (currentUser) {
                if (currentUser.id === userBeingEdited.id) {
                    vm.isCurrentUser = true;
                }
                return userBeingEdited;
            });
        }
    }

    function toggleEditable(){
        vm.editable = !vm.editable;
    }

    function cancelEdit() {
        if ( vm.isModal ){
            return;
        }
        else {
            resetUserForm();
        }
    }

    function setupModalClosingUnsavedChangesWarning(){
        $('#new-user-modal').on('hide.bs.modal', confirmHideModal);
    }

    function resetUserForm() {
        return activate();
    }

    function hideUserModal() {
        $('#new-user-modal').modal('hide');
    }

    function confirmHideModal(modalHideEvent){
        if ( userFormIsDirty() ){
            if ( confirm('You have unsaved changes, are you sure you want to continue?') ){
                $scope.$apply(resetUserForm);
            }
            else {
                modalHideEvent.preventDefault();
            }
        }
    }

    function userFormIsDirty(){
        if ($scope.userForm) {
            return $scope.userForm.$dirty;
        }
        else if ($rootScope.forms && $rootScope.forms.userForm) {
            return $rootScope.forms.userForm.$dirty;
        }
        return false;
    }

    function setUserFormPristine() {
        vm.currentTemplate = templates.userFields;
        
        if ($scope.userForm) {
            $scope.userForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.userForm) {
            $rootScope.forms.userForm.$setPristine();
        }

        if ($scope.oneTimePurchasePricingForm) {
            $scope.oneTimePurchasePricingForm.$setPristine();
        }
        else if ($rootScope.forms && $rootScope.forms.oneTimePurchasePricingForm) {
            $rootScope.forms.oneTimePurchasePricingForm.$setPristine();
        }
    }

    function submitAction() {
        return saveUser();
    }

    function submitLabel() {
        return 'Save';
    }

    function saveUser(){
        translateOptionalSelections();

        if (vm.userId === undefined) {
            return saveNewUser();
        } else {
            return saveExistingUser();
        }
    }

    function translateOptionalSelections() {

    }

    function saveExistingUser() {
        if (!confirmPasswordsMatch()) {
            alertService.putAlert('Passwords do not match', {severity: 'danger'});
            return $q.reject('Passwords do not match');
        }
        return userService.update(vm.user)
            .then(function () {
                alertService.putAlert('User updated', {severity: 'success'});
                return resetUserForm();
            })
            .then(function(){
                hideUserModal();
                afterSubmitCallback();
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }

    function saveNewUser() {
        if (!confirmPasswordsMatch()) {
            alertService.putAlert('Passwords do not match', {severity: 'danger'});
            return $q.reject('Passwords do not match');
        }
        return userService.create(vm.user)
            .then(function () {
                alertService.putAlert('User added', {severity: 'success'});
                return resetUserForm();
            })
            .then(function(){
                hideUserModal();
                afterSubmitCallback();
            })
            .catch(function (error) {
                alertService.putAlert(error, {severity: 'danger'});
            });
    }

    function confirmPasswordsMatch() {
        if (vm.user.password || vm.passwordConfirmation) {
            return vm.user.password == vm.passwordConfirmation;
        }
        return true;
    }
}
