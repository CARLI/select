angular.module('library.entityForms.user')
    .directive('editUser', editUser)
    .directive('editUserModal', editUserModal);

function editUser() {
    var directive = _editUserBaseDirective();
    directive.templateUrl = 'libraryApp/components/entityForms/user/editUser.html';
    return directive;
}

function editUserModal() {
    var directive = _editUserBaseDirective();
    directive.templateUrl = 'libraryApp/components/entityForms/user/editUserModal.html';
    return directive;
}

function _editUserBaseDirective() {
    return {
        restrict: 'E',
        scope: { userId: '=', afterSubmitFn: '=' },
        controller: 'editUserController',
        controllerAs: 'vm'
    };
}


