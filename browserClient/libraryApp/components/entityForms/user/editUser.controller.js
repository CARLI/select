angular.module('library.entityForms.user')
    .controller('editUserController', editUserController);

function editUserController( $filter, $scope, $rootScope, $q, $location, $window, alertService, authService, entityBaseService, errorHandler, userService, libraryService, vendorService  ) {
    var vm = this;

    var currentLibraryId = null;

    var templates = {
        userFields: 'libraryApp/components/entityForms/user/editUser.html'
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
    vm.userIsReadOnly = true;

    setupModalClosingUnsavedChangesWarning();
    activate();

    function activate() {

        currentLibraryId = authService.getCurrentUser().library.id;

        if ($scope.userId === undefined) {
            initializeForNewUser();
        }
        else {
            initializeForExistingUser();
        }

        vm.isModal = vm.newUser;

        setUserFormPristine();
    }

    function initializeForNewUser() {
        vm.editable = true;
        vm.newUser = true;
        vm.userType = $location.path().substring($location.path().lastIndexOf('/') + 1);

        vm.user = {
            type: 'user',
            email: '',
            isActive: true,
            roles: [ 'library' ]
        };

        setUserFormPristine();

        return vm.user;
    }

    function initializeForExistingUser() {
        vm.editable = false;
        vm.newUser = false;

        return userService.load($scope.userId)
            .then(setUserOnVm);

        function setUserOnVm( user ) {
            vm.user = angular.copy(user);
            vm.userType = vm.user.roles[0];
            return user;
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
        vm.user.email = vm.user.email.replace(/[^\x00-\x7F]/g, "");

        setUserRoles();

        if (vm.userId === undefined) {
            return saveNewUser();
        } else {
            return saveExistingUser();
        }
    }

    function setUserRoles() {
        vm.user.roles = [ 'library' ];

        vm.user.roles.push('library-' + currentLibraryId);
        vm.user.library = currentLibraryId;
        vm.user.roles.push('readonly');
    }

    function saveExistingUser() {
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
        return userService.create(vm.user)
            .then(function() {
                userService.notifyCarliOfUserCreation(vm.user);
                userService.requestPasswordReset(vm.user.email);
            })
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
}
