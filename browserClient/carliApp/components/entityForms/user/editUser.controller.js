angular.module('carli.entityForms.user')
    .controller('editUserController', editUserController);

function editUserController( $filter, $scope, $rootScope, $q, $location, $window, alertService, authService, entityBaseService, errorHandler, userService, libraryService, vendorService  ) {
    var vm = this;

    var templates = {
        userFields: 'carliApp/components/entityForms/user/editUser.html'
    };
    vm.currentTemplate = templates.userFields;

    vm.userId = $scope.userId;
    vm.userType = 'staff';
    vm.passwordConfirmation = '';

    var afterSubmitCallback = $scope.afterSubmitFn || function() {};
    vm.toggleEditable = toggleEditable;
    vm.cancelEdit = cancelEdit;
    vm.deleteUser = deleteUser;
    vm.saveUser = saveUser;
    vm.submitAction = submitAction;
    vm.submitLabel = submitLabel;
    vm.statusOptions = entityBaseService.getStatusOptions();
    vm.userIsReadOnly = false;

    setupModalClosingUnsavedChangesWarning();
    activate();

    function activate() {
        vm.isModal = vm.newUser;
        vm.isCurrentUser = false;

        if ($scope.userId === undefined) {
            initializeForNewUser();
            populateLinkingRoleDropdowns();
        }
        else {
            initializeForExistingUser().then(populateLinkingRoleDropdowns);
        }

        function populateLinkingRoleDropdowns() {
            if (vm.userType == 'vendor') {
                return loadVendorList();
            }
            if (vm.userType == 'library') {
                return loadLibraryList();
            }
        }
    }

    function loadVendorList() {
        return vendorService.list().then(function(vendors) {
            var sortedVendors = $filter('orderBy')(vendors, 'name');
            vm.vendors = sortedVendors;
            return sortedVendors;
        });
    }

    function loadLibraryList() {
        return libraryService.list().then(function(libraries) {
            var sortedLibraries = $filter('orderBy')(libraries, 'name');
            vm.libraries = sortedLibraries;
            return sortedLibraries;
        });
    }

    function initializeForNewUser() {
        vm.editable = true;
        vm.newUser = true;
        vm.userType = $location.path().substring($location.path().lastIndexOf('/') + 1);

        vm.user = {
            type: 'user',
            email: '',
            isActive: true,
            roles: [ vm.userType ]
        };

        setUserFormPristine();

        return vm.user;
    }

    function initializeForExistingUser() {
        vm.editable = false;
        vm.newUser = false;

        return userService.load($scope.userId)
            .then(setUserOnVm)
            .then(initializeReadonlyCheckbox)
            .then(function(x) { setUserFormPristine(); return x; })
            .then(loadLinkedRole)
            .then(determineIfUserIsCurrentUser);

        function setUserOnVm( user ) {
            vm.user = angular.copy(user);
            vm.userType = vm.user.roles[0];
            return user;
        }

        function initializeReadonlyCheckbox(x) {
            vm.userIsReadOnly = vm.user.roles.indexOf('readonly') != -1;
            return x;
        }

        function loadLinkedRole(user) {
            if (user.vendor) {
                vendorService.load(user.vendor).then(function(vendor) {
                    vm.selectedVendor = vendor;
                });
            }
            if (user.library) {
                libraryService.load(user.library).then(function(library) {
                    vm.selectedLibrary = library;
                });
            }
            return user;
        }

        function determineIfUserIsCurrentUser(userBeingEdited) {
            return authService.fetchCurrentUser().then(function (currentUser) {
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
        if (!confirmPasswordsMatch()) {
            alertService.putAlert('Passwords do not match', {severity: 'danger'});
            return $q.reject('Passwords do not match');
        }

        vm.user.email = vm.user.email.replace(/[^\x00-\x7F]/g, "");

        setUserRoles();

        if (vm.userId === undefined) {
            return saveNewUser();
        } else {
            return saveExistingUser();
        }
    }

    function setUserRoles() {
        vm.user.roles = [ vm.userType ];

        if (vm.userType == 'vendor') {
            vm.user.roles.push('vendor-' + vm.selectedVendor.id);
            vm.user.vendor = vm.selectedVendor.id;
        }
        if (vm.userType == 'library') {
            vm.user.roles.push('library-' + vm.selectedLibrary.id);
            vm.user.library = vm.selectedLibrary.id;
        }

        if (vm.userIsReadOnly) {
            vm.user.roles.push('readonly');
        }
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

    function deleteUser(){
        if ( isStaff(vm.user) ){
            console.log("Error - can't delete a staff user");
            return false;
        }
        else {
            if ( $window.confirm('Are you sure you want to delete user '+vm.user.name) ){
                return userService.delete(vm.user)
                    .then(function(){
                        alertService.putAlert('User deleted', {severity: 'success'});
                        $location.path('/user/' + vm.userType);
                    })
                    .catch(errorHandler);
            }
        }
    }

    function isStaff(user){
        return user.roles.indexOf('staff') >= 0;
    }

    function confirmPasswordsMatch() {
        if (vm.user.password || vm.passwordConfirmation) {
            return vm.user.password == vm.passwordConfirmation;
        }
        return true;
    }
}
